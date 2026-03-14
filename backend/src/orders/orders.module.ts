import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ProviderModule } from "src/provider/provider.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { OrdersController } from "./orders.controller";
import {
  ORDER_STATUS_UPDATE_QUEUE,
  ORDER_SUBMIT_QUEUE,
} from "./orders.constants";
import { OrdersStatusUpdateProcessor } from "./orders-status-update.processor";
import { OrdersSubmitProcessor } from "./orders-submit.processor";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    PrismaModule,
    ProviderModule,
    BullModule.registerQueue(
      {
        name: ORDER_SUBMIT_QUEUE,
      },
      {
        name: ORDER_STATUS_UPDATE_QUEUE,
      }
    ),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSubmitProcessor, OrdersStatusUpdateProcessor],
  exports: [OrdersService],
})
export class OrdersModule {}
