import { Controller, Get } from '@nestjs/common';
import { success } from '../../common/utils/api-response.util';
import { CategoriesService } from './categories.service';

@Controller('catalog/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    const categories = await this.categoriesService.findCategories();
    return success(categories);
  }
}
