import { Injectable, Logger } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AlbumRepository } from './repositories/album.repository';
import { Album } from '@prisma/client';

@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(private readonly albumRepository: AlbumRepository) {}

  async create(userId: string, data: CreateAlbumDto): Promise<Album> {
    this.logger.log(`Creating new album for user: ${userId}`);
    return this.albumRepository.create({
      ...data,
      userId,
    });
  }

  async findOne(userId: string, id: string): Promise<Album | null> {
    this.logger.debug(`Finding album by ID: ${id} for user: ${userId}`);
    return this.albumRepository.findByIdAndUserId(id, userId);
  }
}
