import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_CONNECTION } from "src/infrastructure/redis/redis.constants";

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CONNECTION) private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {}

  async remember<T>(key: string, loader: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    const value = await loader();
    const ttl = ttlSeconds ?? this.configService.get<number>("cache.ttlSeconds", 120);

    await this.redis.set(key, JSON.stringify(value), "EX", ttl);

    return value;
  }
}
