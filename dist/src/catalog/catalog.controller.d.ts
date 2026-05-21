import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getCategories(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
    getProducts(query: ProductQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedApiResponse<unknown>>;
    getProductBySlug(slug: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        price: string;
        stock: number;
        status: import("@prisma/client").ProductStatus;
        category: {
            id: number;
            name: string;
            slug: string;
        };
        images: Array<{
            id: number;
            url: string;
            alt: string | null;
        }>;
    } & {
        createdAt: Date;
        updatedAt: Date;
    }>>;
}
