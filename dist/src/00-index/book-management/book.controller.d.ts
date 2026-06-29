import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
export declare class BookController {
    private readonly bookService;
    constructor(bookService: BookService);
    create(createBookDto: CreateBookDto): Promise<BookResponseDto>;
    findAll(): Promise<BookResponseDto[]>;
    findOne(id: string): Promise<BookResponseDto>;
    update(id: string, updateBookDto: UpdateBookDto): Promise<BookResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
