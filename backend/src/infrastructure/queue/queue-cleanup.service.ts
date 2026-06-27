import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "src/common/logger/app-logger.service";
import { PrismaService } from "src/prisma/prisma.service";

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class QueueCleanupService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private readonly retentionDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService
  ) {
    this.retentionDays = Number(
      this.configService.get<number>("queue.logRetentionDays") ?? DEFAULT_RETENTION_DAYS
    );
  }

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.cleanup();
    }, DEFAULT_CLEANUP_INTERVAL_MS);

    void this.cleanup();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async cleanup() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.retentionDays);

      const result = await this.prisma.queueJobLog.deleteMany({
        where: {
          createdAt: { lt: cutoff },
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Cleaned up ${result.count} queue job logs older than ${this.retentionDays} days.`,
          "QueueCleanupService"
        );
      }
    } catch (error) {
      this.logger.error(
        `Queue job log cleanup failed: ${(error as Error).message}`,
        (error as Error).stack,
        "QueueCleanupService"
      );
    }
  }
}
