import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { login: jest.Mock };

  beforeEach(async () => {
    service = { login: jest.fn().mockResolvedValue({ accessToken: 'token', email: 'a@b.c' }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login returns the access token', async () => {
    const result = await controller.login({ email: 'a@b.c', password: 'secret' });
    expect(result.accessToken).toBe('token');
    expect(service.login).toHaveBeenCalledWith('a@b.c', 'secret');
  });

  it('verify returns valid session', () => {
    expect(controller.verify({ user: { userId: 1, email: 'a@b.c' } })).toEqual({
      valid: true,
      user: { userId: 1, email: 'a@b.c' },
    });
  });

  it('me returns the current user', () => {
    expect(controller.me({ user: { userId: 1, email: 'a@b.c' } })).toEqual({
      userId: 1,
      email: 'a@b.c',
    });
  });
});
