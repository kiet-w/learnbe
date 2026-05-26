import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AdminUsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllUsers(): Promise<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    updateUser(id: number, data: Prisma.UserUpdateInput): Promise<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
}
