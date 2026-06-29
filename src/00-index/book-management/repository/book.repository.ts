import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, BookSystem } from '@prisma/client';

@Injectable()
export class BookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookSystemCreateInput): Promise<BookSystem> {
    return this.prisma.bookSystem.create({
      data,
    });
  }

  async findAll(): Promise<BookSystem[]> {
    return this.prisma.bookSystem.findMany();
  }

  async findById(id: string): Promise<BookSystem | null> {
    return this.prisma.bookSystem.findUnique({
      where: { id },
    });
  }

  async findByIsbn(isbn: string): Promise<BookSystem | null> {
    return this.prisma.bookSystem.findUnique({
      where: { isbn },
    });
  }

  async update(
    id: string,
    data: Prisma.BookSystemUpdateInput,
  ): Promise<BookSystem> {
    return this.prisma.bookSystem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<BookSystem> {
    return this.prisma.bookSystem.delete({
      where: { id },
    });
  }
}
