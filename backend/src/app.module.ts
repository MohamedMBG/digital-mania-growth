import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { CsrfGuard } from "./common/guards/csrf.guard";
import { RateLimitGuard } from "./common/guards/rate-limit.guard";
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
import { OutboxModule } from "./infrastructure/outbox/outbox.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    OutboxModule,
    UsersModule,
    WalletModule,
    AuthModule,
    AdminModule,
    PaymentsModule,
    OrdersModule,
    ProviderModule,
    PlatformsModule,
    CategoriesModule,
    ServicesModule,
    TicketsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    // Global per-IP rate-limit backstop. Routes with @RateLimit keep their
    // stricter limits; everything else falls back to the guard default.
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    // RolesGuard is applied per-controller (@UseGuards(JwtAccessGuard, RolesGuard))
    // so it runs AFTER JwtAccessGuard populates req.user. Registering it globally
    // made it run before auth, 403-ing every @Roles route (whole admin API).
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
