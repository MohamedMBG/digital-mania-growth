import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_CONNECTION } from "./redis.constants";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
          username: configService.get<string>("redis.username"),
          password: configService.get<string>("redis.password"),
          db: configService.get<number>("redis.db"),
          maxRetriesPerRequest: null,
          lazyConnect: true,
        });

        await redis.connect();

        return redis;
      },
    },
  ],
  exports: [REDIS_CONNECTION],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  async onModuleDestroy() {
    if (this.redis.status !== "end") {
      await this.redis.quit();
    }
  }
}
