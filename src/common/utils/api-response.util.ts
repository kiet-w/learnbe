import {
  ApiResponse,
  PaginatedApiResponse,
} from '../interfaces/api-response.interface';

export function success<T>(
  data: T,
  message: string = 'Thành công',
  statusCode: number = 200,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Thành công',
  statusCode: number = 200,
): PaginatedApiResponse<T> {
  return {
    statusCode,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}
