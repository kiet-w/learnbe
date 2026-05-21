import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma, User } from '@prisma/client';
export declare class UserService {
    private prisma;
    private redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    create(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: Prisma.UserUpdateInput): Promise<User>;
    delete(id: number): Promise<User>;
    getAllUsers(): Promise<any>;
}
