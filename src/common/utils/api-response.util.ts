import {
  ApiResponse,
  PaginatedApiResponse,
} from '../interfaces/api-response.interface';

export function success<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}
