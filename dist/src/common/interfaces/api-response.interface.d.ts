export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}
export interface PaginatedMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginatedApiResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    meta: PaginatedMeta;
}
