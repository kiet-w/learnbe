import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_TYPE } from '../constants/error-code.constant';

export function resolveHttpException(exception: unknown) {
  if (exception instanceof SyntaxError && 'status' in exception && (exception as any).status === 400) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorType: ERROR_TYPE.VALIDATION,
      message: 'Dữ liệu JSON gửi lên không hợp lệ (Syntax Error)',
    };
  }

  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const res = exception.getResponse() as any;
    
    let message = res?.message ?? exception.message;
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    const errorCode = res?.errorCode;

    const errorTypeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: ERROR_TYPE.VALIDATION,
      [HttpStatus.UNAUTHORIZED]: ERROR_TYPE.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ERROR_TYPE.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ERROR_TYPE.NOT_FOUND,
      [HttpStatus.CONFLICT]: 'CONFLICT_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_ERROR',
    };

    return {
      statusCode,
      errorType: errorCode ?? errorTypeMap[statusCode] ?? 'Lỗi_Logic_Nghiệp_Vụ',
      message,
    };
  }

  return null;
}
