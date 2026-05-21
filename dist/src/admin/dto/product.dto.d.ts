import { ProductStatus } from '@prisma/client';
declare class ProductImageInputDto {
    url: string;
    alt?: string;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    price: string;
    stock: number;
    categoryId: number;
    status?: ProductStatus;
    images?: ProductImageInputDto[];
}
export declare class UpdateProductDto {
    name?: string;
    slug?: string;
    description?: string;
    price?: string;
    stock?: number;
    categoryId?: number;
    status?: ProductStatus;
    images?: ProductImageInputDto[];
}
export {};
