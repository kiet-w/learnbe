import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('CrisisManagementTeam');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Xác định Status Code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Lỗi máy chủ nội bộ (Internal server error)';

    if (exception instanceof HttpException) {
      message =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as any).message || exception.message
          : exception.message;
    }

    // 3. Ghi log lỗi chi tiết cho lập trình viên (không trả về cho client)
    this.logger.error(
      `Đường dẫn: ${request.url} | Phương thức: ${request.method} | Lỗi: ${
        exception instanceof Error ? exception.stack : JSON.stringify(exception)
      }`,
    );

    // 4. Trả về format chuẩn cho client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Có sự cố xảy ra, chúng tôi đang xử lý. Xin lỗi bạn vì sự bất tiện này!'
          : message,
    });
  }
}
