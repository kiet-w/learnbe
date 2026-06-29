import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { BookRepository } from './repository/book.repository';

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  async create(createBookDto: CreateBookDto): Promise<BookResponseDto> {
    if (createBookDto.isbn) {
      const existingBook = await this.bookRepository.findByIsbn(
        createBookDto.isbn,
      );
      if (existingBook) {
        throw new ConflictException(
          `Book with ISBN ${createBookDto.isbn} already exists`,
        );
      }
    }
    const book = await this.bookRepository.create(createBookDto);
    return new BookResponseDto(book);
  }

  async findAll(): Promise<BookResponseDto[]> {
    const books = await this.bookRepository.findAll();
    return books.map((book) => new BookResponseDto(book));
  }

  async findOne(id: string): Promise<BookResponseDto> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return new BookResponseDto(book);
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    await this.findOne(id); // Check if book exists

    if (updateBookDto.isbn) {
      const existingBook = await this.bookRepository.findByIsbn(
        updateBookDto.isbn,
      );
      if (existingBook && existingBook.id !== id) {
        throw new ConflictException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
    }

    const updatedBook = await this.bookRepository.update(id, updateBookDto);
    return new BookResponseDto(updatedBook);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Check if book exists
    await this.bookRepository.remove(id);
    return { message: 'Book deleted successfully' };
  }
}
