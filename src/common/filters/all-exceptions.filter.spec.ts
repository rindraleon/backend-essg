import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost;
  });

  it('returns a safe 500 response without stack traces', () => {
    process.env.NODE_ENV = 'production';
    filter.catch(new Error('secret db details'), host);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Erreur interne du serveur',
      data: null,
    });
    const calls = response.json.mock.calls as Record<string, unknown>[][];
    const payload = calls[0][0];
    expect(payload).not.toHaveProperty('stack');
  });
});
