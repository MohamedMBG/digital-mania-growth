import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "src/prisma/prisma.module";
import { OrdersController } from "./orders.controller";
import { PROVIDER_ORDER_QUEUE } from "./orders.constants";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: PROVIDER_ORDER_QUEUE,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
