import { Injectable, Logger } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Album } from '@prisma/client';

@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateAlbumDto): Promise<Album> {
    this.logger.log(`Creating new album for user: ${userId}`);
    return this.prisma.album.create({
      data: { 
        ...data,
        userId,
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Album | null> {
    this.logger.debug(`Finding album by ID: ${id} for user: ${userId}`);
    return this.prisma.album.findUnique({
      where: { 
        id,
        // In Prisma, we can't do a multi-field unique query like this unless there is a compound unique index.
        // We will just fetch by id and verify userId in memory or use findFirst.
      },
    }).then(album => {
      // Ensure the album belongs to the user
      if (album && album.userId !== userId) {
        return null;
      }
      return album;
    });
  }
}
