import { HttpStatus } from '@nestjs/common';
import { ERROR_TYPE } from '../constants/error-code.constant';

export function resolveGenericException(exception: unknown) {
  if (exception instanceof Error) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorType: ERROR_TYPE.INTERNAL,
      message: `Lỗi hệ thống: ${process.env.NODE_ENV !== 'production' ? exception.message : 'Đã có lỗi xảy ra'}`,
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    errorType: ERROR_TYPE.INTERNAL,
    message: 'Lỗi không xác định',
  };
}
