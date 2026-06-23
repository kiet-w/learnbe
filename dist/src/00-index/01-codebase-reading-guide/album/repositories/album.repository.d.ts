import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Album } from '@prisma/client';
export declare class AlbumRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AlbumUncheckedCreateInput): Promise<Album>;
    findByIdAndUserId(id: string, userId: string): Promise<Album | null>;
}
