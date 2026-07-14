import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ORDER_SUBMIT_QUEUE } from "src/orders/orders.constants";
import { PrismaModule } from "src/prisma/prisma.module";
import { OutboxDispatcher } from "./outbox.dispatcher";
import { OutboxService } from "./outbox.service";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: ORDER_SUBMIT_QUEUE }),
  ],
  providers: [OutboxService, OutboxDispatcher],
  exports: [OutboxService],
})
export class OutboxModule {}
