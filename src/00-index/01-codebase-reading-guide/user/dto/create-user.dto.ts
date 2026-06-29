import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  // 🌟 XÓA BỎ HOÀN TOÀN TRƯỜNG ID Ở ĐÂY ĐI! (Vì tạo mới không cần Client gửi ID)

  @IsString()
  @IsNotEmpty() // 🌟 Đổi thành bắt buộc để trùng khớp với schema.prisma
  title!: string; // 🌟 Xóa dấu chấm hỏi (?) đi

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  author?: string;
}