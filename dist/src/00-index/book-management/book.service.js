"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const common_1 = require("@nestjs/common");
const book_response_dto_1 = require("./dto/book-response.dto");
const book_repository_1 = require("./repository/book.repository");
let BookService = class BookService {
    bookRepository;
    constructor(bookRepository) {
        this.bookRepository = bookRepository;
    }
    async create(createBookDto) {
        if (createBookDto.isbn) {
            const existingBook = await this.bookRepository.findByIsbn(createBookDto.isbn);
            if (existingBook) {
                throw new common_1.ConflictException(`Book with ISBN ${createBookDto.isbn} already exists`);
            }
        }
        const book = await this.bookRepository.create(createBookDto);
        return new book_response_dto_1.BookResponseDto(book);
    }
    async findAll() {
        const books = await this.bookRepository.findAll();
        return books.map((book) => new book_response_dto_1.BookResponseDto(book));
    }
    async findOne(id) {
        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        return new book_response_dto_1.BookResponseDto(book);
    }
    async update(id, updateBookDto) {
        await this.findOne(id);
        if (updateBookDto.isbn) {
            const existingBook = await this.bookRepository.findByIsbn(updateBookDto.isbn);
            if (existingBook && existingBook.id !== id) {
                throw new common_1.ConflictException(`Book with ISBN ${updateBookDto.isbn} already exists`);
            }
        }
        const updatedBook = await this.bookRepository.update(id, updateBookDto);
        return new book_response_dto_1.BookResponseDto(updatedBook);
    }
    async remove(id) {
        await this.findOne(id);
        await this.bookRepository.remove(id);
        return { message: 'Book deleted successfully' };
    }
};
exports.BookService = BookService;
exports.BookService = BookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [book_repository_1.BookRepository])
], BookService);
//# sourceMappingURL=book.service.js.map