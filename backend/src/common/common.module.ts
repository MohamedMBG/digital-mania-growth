import { Global, Module } from "@nestjs/common";
import { AppLogger } from "./logger/app-logger.service";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { RateLimitService } from "./rate-limit/rate-limit.service";

@Global()
@Module({
  providers: [AppLogger, RateLimitService, RateLimitGuard],
  exports: [AppLogger, RateLimitService, RateLimitGuard],
})
export class CommonModule {}
