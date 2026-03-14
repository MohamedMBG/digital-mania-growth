import { Controller, Get, Inject } from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "src/prisma/prisma.service";
import { REDIS_CONNECTION } from "src/infrastructure/redis/redis.constants";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CONNECTION) private readonly redis: Redis
  ) {}

  @Get()
  async getHealth() {
    const startedAt = Date.now();

    let postgres = "down";
    let redis = "down";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      postgres = "up";
    } catch {
      postgres = "down";
    }

    try {
      await this.redis.ping();
      redis = "up";
    } catch {
      redis = "down";
    }

    return {
      status: postgres === "up" && redis === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startedAt,
      services: {
        api: "up",
        postgres,
        redis,
      },
    };
  }
}
