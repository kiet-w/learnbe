import { AdminUsersRepository } from './admin-users.repository';
export declare class AdminUsersService {
    private readonly repository;
    private readonly logger;
    constructor(repository: AdminUsersRepository);
    findUsers(): Promise<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    toggleUserLock(adminId: number, userId: number, isActive: boolean): Promise<{
        id: number;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
}
