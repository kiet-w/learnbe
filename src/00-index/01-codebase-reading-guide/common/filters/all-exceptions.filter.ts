import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { 
  extractStackTrace, 
  sanitizeBody, 
  resolvePrismaException, 
  resolveHttpException, 
  resolveGenericException 
} from './helper';
import { ErrorResponse } from './types/error-response.type';

// Interface chung cho kết quả resolve
interface ResolvedError {
  statusCode: number;
  errorType: string;
  message: string | string[];
}

// Fallback tuyệt đối nếu toàn bộ chain trả về null/undefined
const FALLBACK_ERROR: ResolvedError = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  errorType: 'UNKNOWN_ERROR',
  message: 'Lỗi không xác định',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();
    
    if (contextType !== 'http') {
      this.logger.error(`Exception in ${contextType} context`, extractStackTrace(exception));
      return; 
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Lấy Request ID từ middleware (nếu có)
    const requestId = request.requestId ?? 'no-request-id';

    // Chain of Responsibility pattern với fallback an toàn
    const resolved: ResolvedError = resolvePrismaException(exception) 
                                 || resolveHttpException(exception) 
                                 || resolveGenericException(exception)
                                 || FALLBACK_ERROR;

    const { statusCode, errorType, message } = resolved;
    const exactLocation = extractStackTrace(exception, 5);

    this.logError(exception, request, requestId, statusCode, errorType, exactLocation);

    const body: ErrorResponse = {
      statusCode,
      errorType,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      devLocation: process.env.NODE_ENV !== 'production' ? exactLocation : undefined,
    };

    if (!response.headersSent) {
      response.status(statusCode).json(body);
    }
  }

  private logError(
    exception: unknown,
    request: Request,
    requestId: string,
    statusCode: number,
    errorType: string,
    exactLocation: string,
  ) {
    const logContext = JSON.stringify(
      {
        requestId,
        errorType,
        clientIp: request.ip,
        body: sanitizeBody(request.body),
        query: request.query,
        params: request.params,
        exactLocation,
      },
      null,
      2,
    );

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId}] [${request.method}] ${request.url} | STATUS: ${statusCode} | TYPE: ${errorType}`,
        logContext,
      );
    } else {
      this.logger.warn(
        `[${requestId}] [${request.method}] ${request.url} | STATUS: ${statusCode} | TYPE: ${errorType}`,
      );
    }
  }
}
