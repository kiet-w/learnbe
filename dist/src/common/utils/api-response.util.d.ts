import { ApiResponse, PaginatedApiResponse } from '../interfaces/api-response.interface';
export declare function success<T>(data: T, message?: string, statusCode?: number): ApiResponse<T>;
export declare function paginated<T>(data: T[], total: number, page: number, limit: number, message?: string, statusCode?: number): PaginatedApiResponse<T>;
