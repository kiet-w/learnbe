import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayloadDto }>();
    const cookies = request.cookies as Record<string, string | undefined>;
    const token = cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để truy cập trang này',
      );
    }

    const payload = this.authService.validateAccessToken(
      token,
    ) as JwtPayloadDto | null;
    if (!payload) {
      throw new UnauthorizedException(
        'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng làm mới token.',
      );
    }

    // Attach the decoded JWT payload so downstream handlers can enforce ownership/roles.
    request.user = payload;
    return true;
  }
}
