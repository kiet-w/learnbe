import type { Request } from 'express';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class AdminProductsController {
    private readonly adminProductsService;
    constructor(adminProductsService: AdminProductsService);
    createProduct(request: Request & {
        user: JwtPayloadDto;
    }, dto: CreateProductDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>>;
    updateProduct(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateProductDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>>;
    softDeleteProduct(request: Request & {
        user: JwtPayloadDto;
    }, id: number): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>>;
}
