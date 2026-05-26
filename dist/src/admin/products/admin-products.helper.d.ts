import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class AdminProductsHelper {
    formatProductCreateData(dto: CreateProductDto): Prisma.ProductCreateInput;
    formatProductUpdateData(dto: UpdateProductDto): Prisma.ProductUpdateInput;
}
