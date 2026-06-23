import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    request.user = request.user || {
      id: 'mock-user-uuid-12345678',
      email: 'user@example.com',
    };
    return true;
  }
}
