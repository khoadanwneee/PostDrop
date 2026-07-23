import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './auth.types';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return {
      accessToken: request.accessToken,
      user: request.authUser,
      supabase: request.supabase,
    };
  },
);
