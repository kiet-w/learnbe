"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookResponseDto = void 0;
class BookResponseDto {
    id;
    title;
    author;
    isbn;
    pages;
    publishYear;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.BookResponseDto = BookResponseDto;
//# sourceMappingURL=book-response.dto.js.map