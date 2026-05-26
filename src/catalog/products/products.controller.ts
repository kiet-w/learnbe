import { Controller, Get, Param, Query } from '@nestjs/common';
import { paginated, success } from '../../common/utils/api-response.util';
import { ProductsService } from './products.service';
import { ProductQueryDto } from '../dto/product-query.dto';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    const result = await this.productsService.findProducts(query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findProductBySlug(slug);
    return success(product);
  }
}
