import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: unknown): ApiResponse<T> => {
        // Nếu data đã được format bằng hàm success() thì giữ nguyên
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data as ApiResponse<T>;
        }

        const response = context.switchToHttp().getResponse<Response>();

        return {
          statusCode: response.statusCode,
          message: 'Thành công',
          data: (data as T) || (null as unknown as T),
        };
      }),
    );
  }
}
