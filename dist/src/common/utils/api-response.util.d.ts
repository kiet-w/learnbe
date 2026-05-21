import { ApiResponse, PaginatedApiResponse } from '../interfaces/api-response.interface';
export declare function success<T>(data: T): ApiResponse<T>;
export declare function paginated<T>(data: T[], total: number, page: number, limit: number): PaginatedApiResponse<T>;
