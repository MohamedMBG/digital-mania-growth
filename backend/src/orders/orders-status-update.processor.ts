import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { Job, Queue } from "bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { ProviderService } from "src/provider/provider.service";
import { mapProviderStatus } from "./orders-status.mapper";
import {
  ORDER_STATUS_UPDATE_JOB,
  ORDER_STATUS_UPDATE_QUEUE,
} from "./orders.constants";
import { OrderStatusUpdateJobData, TERMINAL_ORDER_STATUSES } from "./orders.types";

@Injectable()
@Processor(ORDER_STATUS_UPDATE_QUEUE)
export class OrdersStatusUpdateProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: ProviderService,
    @InjectQueue(ORDER_STATUS_UPDATE_QUEUE)
    private readonly orderStatusQueue: Queue
  ) {
    super();
  }

  async process(job: Job<OrderStatusUpdateJobData>) {
    if (job.name !== ORDER_STATUS_UPDATE_JOB) {
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: job.data.orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found for status sync.");
    }

    if (!order.providerOrderId || TERMINAL_ORDER_STATUSES.includes(order.status)) {
      return;
    }

    const providerStatus = await this.providerService.getOrderStatus({
      order: order.providerOrderId,
    });

    const nextStatus = mapProviderStatus(providerStatus.status);
    const startCount = this.parseNullableInt(providerStatus.start_count);
    const remains = this.parseNullableInt(providerStatus.remains);

    const shouldLog =
      nextStatus !== order.status ||
      startCount !== order.startCount ||
      remains !== order.remains;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          startCount,
          remains,
        },
      });

      if (shouldLog) {
        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            status: nextStatus,
            message: `Provider status synchronized: ${providerStatus.status}.`,
            metadata: {
              providerStatus: providerStatus.status,
              startCount,
              remains,
            },
          },
        });
      }

      await tx.queueJobLog.create({
        data: {
          queueName: ORDER_STATUS_UPDATE_QUEUE,
          jobName: ORDER_STATUS_UPDATE_JOB,
          status: "completed",
          payload: {
            orderId: order.id,
            providerStatus: providerStatus.status,
            mappedStatus: nextStatus,
            startCount,
            remains,
          },
        },
      });
    });

    if (!TERMINAL_ORDER_STATUSES.includes(nextStatus)) {
      await this.orderStatusQueue.add(
        ORDER_STATUS_UPDATE_JOB,
        { orderId: order.id },
        {
          jobId: `status:${order.id}:${Date.now()}`,
          delay: 60_000,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 10_000,
          },
        }
      );
    }
  }

  private parseNullableInt(value?: string) {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
