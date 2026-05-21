import { UserRole } from '@prisma/client';
export declare class JwtPayloadDto {
    userId: number;
    email: string;
    role: UserRole;
}
