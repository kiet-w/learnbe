import { UserRole } from '@prisma/client';
export declare class UserResponseDto {
    id: number;
    email: string;
    name: string | null;
    role: UserRole;
    password?: string;
    refreshToken?: string | null;
    constructor(partial: Partial<UserResponseDto>);
}
export declare class AuthResponseDto {
    success: boolean;
    message?: string;
    accessToken?: string;
    user?: UserResponseDto;
    constructor(partial: Partial<AuthResponseDto>);
}
