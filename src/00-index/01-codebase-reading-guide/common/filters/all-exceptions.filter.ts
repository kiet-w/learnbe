import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Inject,
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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();
    
    if (contextType !== 'http') {
      this.logger.error?.(`Exception in ${contextType} context`, extractStackTrace(exception));
      return; 
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Chain of Responsibility pattern
    // resolvePrisma → resolveHttp trả null nếu không match
    // resolveGeneric luôn trả object (fallback cuối cùng, không bao giờ null)
    const resolved: ResolvedError = resolvePrismaException(exception) 
                                 || resolveHttpException(exception) 
                                 || resolveGenericException(exception);

    const { statusCode, errorType, message } = resolved;
    const exactLocation = extractStackTrace(exception);

    this.logError(exception, request, statusCode, errorType, exactLocation);

    const body: ErrorResponse = {
      statusCode,
      errorType,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      devLocation: process.env.NODE_ENV !== 'production' ? exactLocation : undefined,
    };

    if (!response.headersSent) {
      response.status(statusCode).json(body);
    }
  }

  private logError(
    exception: unknown,
    request: Request,
    statusCode: number,
    errorType: string,
    exactLocation: string,
  ) {
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error?.(
        `[${request.method}] ${request.url} | STATUS: ${statusCode} | TYPE: ${errorType}`,
        JSON.stringify(
          {
            errorType,
            clientIp: request.ip,
            body: sanitizeBody(request.body),
            query: request.query,
            params: request.params,
            exactLocation,
          },
          null,
          2,
        ),
      );
    } else {
      this.logger.warn?.(`[${request.method}] ${request.url} | STATUS: ${statusCode} | MSG: ${(exception as any)?.message}`);
    }
  }
}
