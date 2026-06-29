import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODE, ERROR_TYPE } from '../constants/error-code.constant';

export function resolvePrismaException(exception: unknown) {
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case PRISMA_ERROR_CODE.UNIQUE_VIOLATION:
        return {
          statusCode: HttpStatus.CONFLICT,
          errorType: ERROR_TYPE.DB_DUPLICATE,
          message: `Dữ liệu đã tồn tại (vi phạm unique tại: ${exception.meta?.target ?? 'không rõ'})`,
        };
      case PRISMA_ERROR_CODE.RECORD_NOT_FOUND:
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorType: ERROR_TYPE.DB_NOT_FOUND,
          message: 'Bản ghi không tồn tại hoặc đã bị xóa',
        };
      case PRISMA_ERROR_CODE.FOREIGN_KEY_VIOLATION:
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorType: ERROR_TYPE.DB_FOREIGN_KEY,
          message: 'Vướng dữ liệu liên quan (khóa ngoại)',
        };
      default:
        return {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          errorType: `${ERROR_TYPE.INTERNAL}_Prisma_${exception.code}`,
          message: `Lỗi truy vấn Prisma mã ${exception.code}: ${exception.message}`,
        };
    }
  }

  if (exception instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorType: ERROR_TYPE.VALIDATION,
      message: 'Truy vấn gửi xuống Database sai cú pháp hoặc thiếu tham số',
    };
  }

  return null;
}
