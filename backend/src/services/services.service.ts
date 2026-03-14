import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ListServicesQueryDto } from "./dto/list-services-query.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listServices(query: ListServicesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(query.platformSlug ? { platform: { slug: query.platformSlug, isActive: true } } : {}),
      ...(query.categorySlug ? { category: { slug: query.categorySlug, isActive: true } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      success: true,
      message: "Services loaded successfully.",
      data: items.map((service) => this.serializeService(service)),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async listFeaturedServices(query: ListServicesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      isFeatured: true,
      ...(query.platformSlug ? { platform: { slug: query.platformSlug, isActive: true } } : {}),
      ...(query.categorySlug ? { category: { slug: query.categorySlug, isActive: true } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      success: true,
      message: "Featured services loaded successfully.",
      data: items.map((service) => this.serializeService(service)),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getServiceBySlug(slugOrId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        isActive: true,
        platform: { isActive: true },
        category: { isActive: true },
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found.");
    }

    return {
      success: true,
      message: "Service loaded successfully.",
      data: this.serializeService(service),
    };
  }

  private serializeService(service: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    pricePerK: { toNumber(): number };
    minOrder: number;
    maxOrder: number;
    deliverySpeed: string | null;
    guarantee: string | null;
    refillPolicy: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    platform: Record<string, unknown>;
    category: Record<string, unknown>;
  }) {
    return {
      ...service,
      pricePerK: service.pricePerK.toNumber(),
    };
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}
