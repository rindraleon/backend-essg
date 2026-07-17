import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface User {
  id: string;
  email: string;
}

interface RequestWithUser {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
