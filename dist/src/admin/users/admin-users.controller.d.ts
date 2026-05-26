import type { Request } from 'express';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AdminUsersService } from './admin-users.service';
export declare class AdminUsersController {
    private readonly adminUsersService;
    constructor(adminUsersService: AdminUsersService);
    getUsers(): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>>;
    toggleUserLock(request: Request & {
        user: JwtPayloadDto;
    }, id: number, isActive: boolean): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>>;
}
