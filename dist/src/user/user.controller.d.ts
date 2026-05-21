import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(data: Prisma.UserCreateInput): Promise<{
        id: number;
        email: string;
        name: string | null;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    } | null>;
    update(id: number, data: Prisma.UserUpdateInput): Promise<{
        id: number;
        email: string;
        name: string | null;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
