import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

type MigrationRow = {
  id: string;
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.verifyMigrations();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }

  private async verifyMigrations() {
    try {
      const rows = await this.$queryRaw<MigrationRow[]>`
        SELECT id, migration_name, finished_at, rolled_back_at
        FROM "_prisma_migrations"
        WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
      `;

      if (rows.length > 0) {
        const names = rows.map((r) => r.migration_name).join(", ");
        const message = `Prisma has incomplete or rolled-back migrations: ${names}. Run "prisma migrate deploy" before starting.`;

        if (process.env.NODE_ENV === "production") {
          throw new Error(message);
        }

        console.warn(`[PrismaService] WARNING: ${message}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("prisma migrate deploy")) {
        throw error;
      }
      // _prisma_migrations table may not exist on first run before any migration
    }
  }
}
