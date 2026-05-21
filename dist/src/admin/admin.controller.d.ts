import type { Request } from 'express';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { AdminService } from './admin.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { AdminOrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createCategory(request: Request & {
        user: JwtPayloadDto;
    }, dto: CreateCategoryDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    updateCategory(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateCategoryDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    createProduct(request: Request & {
        user: JwtPayloadDto;
    }, dto: CreateProductDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
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
    }, id: number, dto: UpdateProductDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
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
    }, id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
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
    getOrders(query: AdminOrderQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedApiResponse<import("./dto/order.dto").AdminOrderResponseDto>>;
    updateOrderStatus(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateOrderStatusDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./dto/order.dto").AdminOrderResponseDto>>;
}
