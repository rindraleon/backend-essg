import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Utilisateur } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let repo: { findOne: jest.Mock };
  let jwt: { sign: jest.Mock };

  const user: Utilisateur = {
    id: 1,
    email: 'admin@essg.sn',
    motDePasse: '$2b$10$abcdefghijklmnopqrstuv',
    prenom: 'Admin',
    nom: 'System',
    role: 'admin',
    estActif: true,
    avatar: undefined,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    repo = { findOne: jest.fn() };
    jwt = { sign: jest.fn().mockReturnValue('token') };

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Utilisateur), useValue: repo },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: jest.fn(() => 'x') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login returns an access token for valid credentials', async () => {
    repo.findOne.mockResolvedValue(user);
    const result = await service.login('admin@essg.sn', 'password');
    expect(result.accessToken).toBe('token');
    expect(result.email).toBe('admin@essg.sn');
  });

  it('login throws UnauthorizedException for invalid credentials', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.login('x@essg.sn', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('validateToken returns false when user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.validateToken({ email: 'a@b.c', sub: 1 })).resolves.toBe(false);
  });

  it('validateToken returns true when user exists', async () => {
    repo.findOne.mockResolvedValue(user);
    await expect(service.validateToken({ email: 'admin@essg.sn', sub: 1 })).resolves.toBe(true);
  });
});
