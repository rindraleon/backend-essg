import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { ActivityLogInterceptor } from './activity-log.interceptor';
import { ActivityLogDescriptionService } from '../../modules/activity-logs/activity-log-description.service';

interface LogPayload {
  userId: number | null;
  method: string;
  module: string;
  endpoint: string;
  success: boolean;
  statusCode: number;
  description: string;
  metadata: Record<string, unknown> | null;
}

describe('ActivityLogInterceptor', () => {
  let interceptor: ActivityLogInterceptor;
  let createSpy: jest.Mock;

  const user = { userId: 1, role: 'admin', email: 'a@b.c', nom: 'Doe', prenom: 'John' };

  beforeEach(() => {
    createSpy = jest.fn().mockResolvedValue(undefined);
    const service = { create: createSpy };
    const descriptionService = new ActivityLogDescriptionService();
    interceptor = new ActivityLogInterceptor(service as never, descriptionService);
  });

  const lastPayload = (): LogPayload => (createSpy.mock.calls as LogPayload[][])[0][0];

  const makeContext = (method: string, url: string, body?: Record<string, unknown>) => {
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const params: Record<string, string> = segments.length > 1 ? { id: segments[1] } : {};
    const response = { statusCode: 201 } as { statusCode: number };
    const request = {
      method,
      originalUrl: url,
      path,
      ip: '127.0.0.1',
      headers: {},
      user,
      body: body ?? {},
      params,
    };
    return {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as never;
  };

  const run = (context: never, value: unknown) =>
    interceptor.intercept(context, { handle: () => of(value) } as never).toPromise();

  it('creates a log for a POST request', async () => {
    await run(makeContext('POST', '/users'), { id: 1 });
    expect(createSpy).toHaveBeenCalledTimes(1);
    const data = lastPayload();
    expect(data.method).toBe('POST');
    expect(data.module).toBe('users');
    expect(data.endpoint).toBe('/users');
    expect(data.success).toBe(true);
    expect(data.statusCode).toBe(201);
    expect(data.userId).toBe(1);
  });

  it('creates a log for a PUT request', async () => {
    await run(makeContext('PUT', '/users/15'), {});
    const data = lastPayload();
    expect(data.method).toBe('PUT');
    expect(data.module).toBe('users');
    expect(data.metadata).toEqual({ entityType: 'User', entityId: 15 });
  });

  it('creates a log for a PATCH request', async () => {
    await run(makeContext('PATCH', '/users/15'), {});
    expect(lastPayload().method).toBe('PATCH');
  });

  it('creates a log for a DELETE request', async () => {
    await run(makeContext('DELETE', '/users/15'), {});
    expect(lastPayload().method).toBe('DELETE');
  });

  it('does not create a log for a GET request', async () => {
    await run(makeContext('GET', '/users'), {});
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('associates the authenticated user', async () => {
    await run(makeContext('POST', '/users'), {});
    expect(lastPayload().userId).toBe(1);
  });

  it('identifies the module from the endpoint', async () => {
    await run(makeContext('POST', '/admissions'), {});
    expect(lastPayload().module).toBe('admissions');
  });

  it('generates a human description', async () => {
    await run(makeContext('POST', '/users'), {});
    expect(lastPayload().description).toBe("Création d'un utilisateur.");
  });

  it('records admission acceptance description', async () => {
    await run(makeContext('PATCH', '/admissions/25/status', { statut: 'accepte' }), {});
    const data = lastPayload();
    expect(data.metadata?.status).toBe('accepte');
    expect(data.description).toBe("Acceptation d'une demande d'admission.");
  });

  it('records a failed operation as unsuccessful', async () => {
    const ctx = makeContext('POST', '/users');
    await interceptor
      .intercept(ctx, { handle: () => throwError(() => new BadRequestException('boom')) } as never)
      .toPromise()
      .catch(() => undefined);
    const data = lastPayload();
    expect(data.success).toBe(false);
    expect(data.statusCode).toBe(400);
  });

  it('an ActivityLog error does not break the business operation', async () => {
    createSpy.mockRejectedValue(new Error('db down'));
    const result = await run(makeContext('POST', '/users'), { id: 1 });
    expect(result).toEqual({ id: 1 });
  });
});
