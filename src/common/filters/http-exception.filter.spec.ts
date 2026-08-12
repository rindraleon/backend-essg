import { ArgumentsHost, BadRequestException, ForbiddenException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost;
  });

  it('formats a string exception message', () => {
    filter.catch(new BadRequestException('Invalid payload'), host);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Invalid payload',
      data: null,
    });
  });

  it('joins array validation messages', () => {
    filter.catch(new BadRequestException(['email must be valid', 'name required']), host);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'email must be valid, name required',
      data: null,
    });
  });

  it('returns the exception status code', () => {
    filter.catch(new ForbiddenException('Accès refusé'), host);
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it('never leaks stack traces', () => {
    const error = new BadRequestException('boom');
    filter.catch(error, host);
    const calls = response.json.mock.calls as Record<string, unknown>[][];
    const payload = calls[0][0];
    expect(JSON.stringify(payload)).not.toContain('at ');
    expect(payload).not.toHaveProperty('stack');
  });
});
