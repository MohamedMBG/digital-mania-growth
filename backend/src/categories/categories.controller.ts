import { Controller, Get, Query } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { ListCategoriesQueryDto } from "./dto/list-categories-query.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  listCategories(@Query() query: ListCategoriesQueryDto) {
    return this.categoriesService.listCategories(query);
  }
}
