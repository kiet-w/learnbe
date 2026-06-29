import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { BookRepository } from './repository/book.repository';
export declare class BookService {
    private readonly bookRepository;
    constructor(bookRepository: BookRepository);
    create(createBookDto: CreateBookDto): Promise<BookResponseDto>;
    findAll(): Promise<BookResponseDto[]>;
    findOne(id: string): Promise<BookResponseDto>;
    update(id: string, updateBookDto: UpdateBookDto): Promise<BookResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
