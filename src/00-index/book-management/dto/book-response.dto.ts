export class BookResponseDto {
  id!: string; // (1)
  title!: string; // (2)
  author!: string | null; // (3) Prisma trả về null nếu không có data
  isbn!: string | null; // (4)
  pages!: number; // (5)
  publishYear!: number | null; // (6)

  // Constructor để map dữ liệu từ DB (Prisma) sang DTO
  constructor(partial: Partial<BookResponseDto>) {
    Object.assign(this, partial);
  }
}
