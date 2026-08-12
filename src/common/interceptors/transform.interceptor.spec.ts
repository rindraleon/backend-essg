import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const createContext = (statusCode: number, message?: string): ExecutionContext => {
    const handler = () => undefined;
    if (message) {
      Reflect.defineMetadata('apiMessage', message, handler);
    }
    return {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
        getRequest: () => ({}),
      }),
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  };

  it('wraps data into the standard envelope', (done) => {
    interceptor
      .intercept(createContext(HttpStatus.OK), { handle: () => of({ id: 1 }) } as never)
      .subscribe((result) => {
        expect(result).toEqual({
          statusCode: 200,
          message: 'Données récupérées avec succès',
          data: { id: 1 },
        });
        done();
      });
  });

  it('uses the route-specific message when provided', (done) => {
    interceptor
      .intercept(createContext(HttpStatus.CREATED, 'Ressource créée'), {
        handle: () => of({ id: 1 }),
      } as never)
      .subscribe((result) => {
        expect(result.message).toBe('Ressource créée');
        expect(result.statusCode).toBe(201);
        done();
      });
  });

  it('maps null-ish data to null', (done) => {
    interceptor
      .intercept(createContext(HttpStatus.OK), { handle: () => of(undefined) } as never)
      .subscribe((result) => {
        expect(result.data).toBeNull();
        done();
      });
  });
});
