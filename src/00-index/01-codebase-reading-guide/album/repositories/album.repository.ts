import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Album } from '@prisma/client';

@Injectable()
export class AlbumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AlbumUncheckedCreateInput): Promise<Album> {
    return this.prisma.album.create({
      data,
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Album | null> {
    // Dùng findFirst để query theo cả id và userId
    return this.prisma.album.findFirst({
      where: { id, userId },
    });
  }
}
