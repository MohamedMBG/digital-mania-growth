import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PlatformsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlatforms() {
    const platforms = await this.prisma.platform.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        sortOrder: true,
      },
    });

    return {
      success: true,
      message: "Platforms loaded successfully.",
      data: platforms,
    };
  }
}
