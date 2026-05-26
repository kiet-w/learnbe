import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({ data });
    await this.redisService.del('all_users');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({ where: { id }, data });
    await this.redisService.del('all_users');
    return user;
  }

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id } });
    await this.redisService.del('all_users');
    return user;
  }

  async getAllUsers() {
    return this.redisService.getOrSet(
      'all_users',
      async () => {
        return this.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
          },
        });
      },
      30000, // 30 seconds
    );
  }
}
