import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Response } from 'express';
export declare class AuthService {
    private userService;
    private configService;
    private readonly JWT_ACCESS_SECRET;
    private readonly JWT_REFRESH_SECRET;
    constructor(userService: UserService, configService: ConfigService);
    register(data: RegisterDto): Promise<AuthResponseDto>;
    login(data: LoginDto, response: Response): Promise<AuthResponseDto>;
    handleRefresh(refreshToken: string | undefined, response: Response): Promise<AuthResponseDto>;
    handleLogout(accessToken: string | undefined, response: Response): Promise<AuthResponseDto>;
    logout(userId: number): Promise<void>;
    private setCookies;
    private generateTokens;
    private updateRefreshToken;
    validateAccessToken(token: string): string | jwt.JwtPayload | null;
}
