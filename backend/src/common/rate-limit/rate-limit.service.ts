import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CONNECTION } from "src/infrastructure/redis/redis.constants";

type RateLimitResult = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitService {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  async consume(key: string, windowMs: number): Promise<RateLimitResult> {
    const namespacedKey = `rate-limit:${key}`;
    const count = await this.redis.incr(namespacedKey);

    if (count === 1) {
      await this.redis.pexpire(namespacedKey, windowMs);
    }

    const ttl = await this.redis.pttl(namespacedKey);
    const safeTtl = ttl > 0 ? ttl : windowMs;

    return {
      count,
      resetAt: Date.now() + safeTtl,
    };
  }
}
