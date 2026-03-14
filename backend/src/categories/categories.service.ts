import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ListCategoriesQueryDto } from "./dto/list-categories-query.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(query: ListCategoriesQueryDto) {
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
  }
}
