import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { RolesGuard } from "./auth/guards/roles.guard";
import { CategoriesModule } from "./categories/categories.module";
import { CommonModule } from "./common/common.module";
import { AppConfigModule } from "./config/config.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PaymentsModule } from "./payments/payments.module";
import { PlatformsModule } from "./platforms/platforms.module";
import { ProviderModule } from "./provider/provider.module";
import { ServicesModule } from "./services/services.module";
import { TicketsModule } from "./tickets/tickets.module";
import { UsersModule } from "./users/users.module";
import { WalletModule } from "./wallet/wallet.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    UsersModule,
    WalletModule,
    AuthModule,
    AdminModule,
    PaymentsModule,
    OrdersModule,
    ProviderModule,
    TicketsModule,
    PlatformsModule,
    CategoriesModule,
    ServicesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
