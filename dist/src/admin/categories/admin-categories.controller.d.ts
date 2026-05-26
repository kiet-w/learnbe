import type { Request } from 'express';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class AdminCategoriesController {
    private readonly adminCategoriesService;
    constructor(adminCategoriesService: AdminCategoriesService);
    createCategory(request: Request & {
        user: JwtPayloadDto;
    }, dto: CreateCategoryDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    updateCategory(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateCategoryDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
}
