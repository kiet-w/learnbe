import type { Request } from 'express';
import { UserService } from './user.service';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';
import { UpdateMeDto } from './dto/update-me.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getMe(request: Request & {
        user: JwtPayloadDto;
    }): Promise<UserResponseDto>;
    updateMe(request: Request & {
        user: JwtPayloadDto;
    }, dto: UpdateMeDto): Promise<UserResponseDto>;
}
