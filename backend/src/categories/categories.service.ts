import { Injectable } from "@nestjs/common";
import { CacheService } from "src/common/cache/cache.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ListCategoriesQueryDto } from "./dto/list-categories-query.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  async listCategories(query: ListCategoriesQueryDto) {
    const cacheKey = `catalog:categories:${query.platformSlug ?? "all"}`;

    return this.cacheService.remember(cacheKey, async () => {
      const categories = await this.prisma.category.findMany({
        where: {
          isActive: true,
          platform: {
            isActive: true,
            ...(query.platformSlug ? { slug: query.platformSlug } : {}),
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          sortOrder: true,
          platform: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Categories loaded successfully.",
        data: categories,
      };
    });
  }
}
