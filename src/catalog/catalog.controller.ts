import { Controller, Get, Param, Query } from '@nestjs/common';
import { paginated, success } from '../common/utils/api-response.util';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  async getCategories() {
    const categories = await this.catalogService.findCategories();
    return success(categories);
  }

  @Get('products')
  async getProducts(@Query() query: ProductQueryDto) {
    const result = await this.catalogService.findProducts(query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.catalogService.findProductBySlug(slug);
    return success(product);
  }
}
