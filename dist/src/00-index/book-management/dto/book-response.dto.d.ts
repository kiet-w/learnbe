export declare class BookResponseDto {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    pages: number;
    publishYear: number | null;
    constructor(partial: Partial<BookResponseDto>);
}
