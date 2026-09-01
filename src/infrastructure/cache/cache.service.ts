import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  buildCacheKey,
  buildResourcePrefix,
  CACHE_TTL,
  type CacheResource,
} from './cache.constants';

export interface CacheOptions {
  ttl?: number;
  stampedeProtection?: boolean;
}

interface InMemoryEntry {
  value: unknown;
  expiresAt: number;
}

const SCAN_BATCH_SIZE = 500;
const CONNECT_TIMEOUT_MS = 5_000;
const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/**
 * Cache applicatif unifié : Redis en production (REDIS_ENABLED=true),
 * mémoire locale en développement (valeur par défaut, zéro configuration).
 * La même API est utilisée par l'ensemble des services métier.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly pending = new Map<string, Promise<unknown>>();
  private readonly memoryEntries = new Map<string, InMemoryEntry>();
  private readonly cleanupTimer = setInterval(() => this.removeExpired(), 60_000);
  private readonly redisEnabled: boolean;

  private redis: Redis | null = null;
  private redisHealthy = false;
  private redisFailureLogged = false;

  constructor(private readonly configService: ConfigService) {
    this.redisEnabled = this.configService.get<string>('REDIS_ENABLED') === 'true';
  }

  onModuleInit(): void {
    if (!this.redisEnabled) {
      this.logger.log('Cache local en mémoire (REDIS_ENABLED=false)');
      return;
    }
    this.connectRedis();
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
    this.memoryEntries.clear();
    this.pending.clear();
    void this.redis?.quit();
    this.redis = null;
  }

  listKey(resource: CacheResource, params: Record<string, unknown> = {}): string {
    return buildCacheKey(resource, 'list', params);
  }

  itemKey(resource: CacheResource, id: string | number): string {
    return buildCacheKey(resource, 'id', id);
  }

  slugKey(resource: CacheResource, slug: string): string {
    return buildCacheKey(resource, 'slug', slug);
  }

  viewKey(
    resource: CacheResource,
    segment: string,
    params?: Record<string, unknown> | string | number,
  ): string {
    return buildCacheKey(resource, segment, params);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisEnabled) return this.getFromMemory<T>(key);
    if (!this.redis) return null;
    try {
      const raw = await this.redis.get(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      this.logRedisFailure(error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    if ((value as unknown) === null || typeof value === 'undefined') return;
    if (!this.redisEnabled) {
      this.setInMemory(key, value, ttl);
      return;
    }
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', Math.max(1, ttl));
    } catch (error) {
      this.logRedisFailure(error);
    }
  }

  async getOrSet<T>(key: string, loader: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    if (options.stampedeProtection) {
      const existing = this.pending.get(key);
      if (existing) return existing as Promise<T>;
    }

    const request = this.loadAndCache(key, loader, options.ttl ?? CACHE_TTL.MEDIUM);
    if (options.stampedeProtection) this.pending.set(key, request);
    try {
      return await request;
    } finally {
      this.pending.delete(key);
    }
  }

  async invalidateKey(key: string): Promise<void> {
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        this.logRedisFailure(error);
      }
    }
    this.memoryEntries.delete(key);
  }

  async invalidateResource(...resources: CacheResource[]): Promise<void> {
    const prefixes = resources.map(buildResourcePrefix);
    if (this.redisEnabled && this.redis) {
      try {
        await this.deleteByPrefixes(prefixes);
      } catch (error) {
        this.logRedisFailure(error);
      }
    }
    for (const key of this.memoryEntries.keys()) {
      if (prefixes.some((prefix) => key.startsWith(prefix))) this.memoryEntries.delete(key);
    }
  }

  isAvailable(): boolean {
    return this.redisEnabled ? this.redisHealthy : true;
  }

  isRedisMode(): boolean {
    return this.redisEnabled;
  }

  async ping(): Promise<boolean> {
    if (!this.redisEnabled) return true;
    if (!this.redis) return false;
    try {
      return Boolean(await this.redis.ping());
    } catch (error) {
      this.logRedisFailure(error);
      return false;
    }
  }

  private connectRedis(): void {
    const client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: Number(this.configService.get<string>('REDIS_PORT') ?? 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') ?? undefined,
      db: Number(this.configService.get<string>('REDIS_DB') ?? 0),
      lazyConnect: true,
      connectTimeout: CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => Math.min(RETRY_BASE_MS * 2 ** (times - 1), RETRY_MAX_MS),
    });

    client.on('ready', () => {
      this.redisHealthy = true;
      this.redisFailureLogged = false;
      this.logger.log('Connexion Redis établie');
    });
    client.on('error', (error: Error) => {
      this.redisHealthy = false;
      this.logRedisFailure(error);
    });

    this.redis = client;
    void client.connect().catch((error: unknown) => {
      this.logRedisFailure(error);
    });
  }

  private async loadAndCache<T>(key: string, loader: () => Promise<T>, ttl: number): Promise<T> {
    const value = await loader();
    await this.set(key, value, ttl);
    return value;
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryEntries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.memoryEntries.delete(key);
      return null;
    }
    return entry.value as T;
  }

  private setInMemory<T>(key: string, value: T, ttl: number): void {
    this.memoryEntries.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }

  private removeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryEntries) {
      if (entry.expiresAt <= now) this.memoryEntries.delete(key);
    }
  }

  private async deleteByPrefixes(prefixes: string[]): Promise<void> {
    if (!this.redis) return;
    const keys: string[] = [];
    for (const prefix of prefixes) {
      let cursor = '0';
      do {
        const [nextCursor, found] = await this.redis.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          SCAN_BATCH_SIZE,
        );
        cursor = nextCursor;
        keys.push(...found);
      } while (cursor !== '0');
    }
    if (keys.length > 0) await this.redis.del(...keys);
  }

  private logRedisFailure(error: unknown): void {
    if (this.redisFailureLogged) return;
    this.redisFailureLogged = true;
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Redis indisponible — le cache est contourné: ${message}`);
  }
}
