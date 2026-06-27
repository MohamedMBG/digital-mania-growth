import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { QueueCleanupService } from "./queue-cleanup.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
          username: configService.get<string>("redis.username"),
          password: configService.get<string>("redis.password"),
          db: configService.get<number>("redis.db"),
        },
        prefix: configService.get<string>("queue.prefix"),
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        },
      }),
    }),
  ],
  providers: [QueueCleanupService],
})
export class QueueModule {}
