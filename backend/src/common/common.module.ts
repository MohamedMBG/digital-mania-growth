import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache/cache.service";
import { AppLogger } from "./logger/app-logger.service";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { RateLimitService } from "./rate-limit/rate-limit.service";

@Global()
@Module({
  providers: [AppLogger, CacheService, RateLimitService, RateLimitGuard],
  exports: [AppLogger, CacheService, RateLimitService, RateLimitGuard],
})
export class CommonModule {}
