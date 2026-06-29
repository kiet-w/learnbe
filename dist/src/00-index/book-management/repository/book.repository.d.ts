import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, BookSystem } from '@prisma/client';
export declare class BookRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.BookSystemCreateInput): Promise<BookSystem>;
    findAll(): Promise<BookSystem[]>;
    findById(id: string): Promise<BookSystem | null>;
    findByIsbn(isbn: string): Promise<BookSystem | null>;
    update(id: string, data: Prisma.BookSystemUpdateInput): Promise<BookSystem>;
    remove(id: string): Promise<BookSystem>;
}
