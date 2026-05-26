import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    private redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    create(data: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: UpdateUserDto): Promise<User>;
    delete(id: number): Promise<User>;
    getAllUsers(): Promise<any>;
}
