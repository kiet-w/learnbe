export type SortQuery = 'price_asc' | 'price_desc' | 'created_asc' | 'created_desc';
export declare class PaginationQueryDto {
    page: number;
    limit: number;
    search?: string;
    category?: number;
    minPrice?: string;
    maxPrice?: string;
    sort: SortQuery;
}
