import { SetMetadata } from "@nestjs/common";

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
};

export const RATE_LIMIT_OPTIONS = "rate-limit-options";

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_OPTIONS, options);
