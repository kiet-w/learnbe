import { CreateAlbumDto } from './dto/create-album.dto';
import { AlbumRepository } from './repositories/album.repository';
import { Album } from '@prisma/client';
export declare class AlbumService {
    private readonly albumRepository;
    private readonly logger;
    constructor(albumRepository: AlbumRepository);
    create(userId: string, data: CreateAlbumDto): Promise<Album>;
    findOne(userId: string, id: string): Promise<Album | null>;
}
