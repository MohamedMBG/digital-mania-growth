import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { Job, Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { ProviderService } from "src/provider/provider.service";
import {
  ORDER_STATUS_UPDATE_JOB,
  ORDER_STATUS_UPDATE_QUEUE,
  ORDER_SUBMIT_JOB,
  ORDER_SUBMIT_QUEUE,
} from "./orders.constants";
import { OrderSubmitJobData } from "./orders.types";

@Injectable()
@Processor(ORDER_SUBMIT_QUEUE)
export class OrdersSubmitProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: ProviderService,
    @InjectQueue(ORDER_STATUS_UPDATE_QUEUE)
    private readonly orderStatusQueue: Queue
  ) {
    super();
  }

  async process(job: Job<OrderSubmitJobData>) {
    if (job.name !== ORDER_SUBMIT_JOB) {
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: job.data.orderId },
    });

    if (!order) {
      throw new NotFoundException("Queued order not found.");
    }

    if (order.status !== OrderStatus.queued || !order.providerServiceId) {
      return;
    }

    const providerOrder = await this.providerService.createOrder({
      service: order.providerServiceId,
      link: order.targetUrl,
      quantity: order.quantity,
    });

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: {
          providerOrderId: String(providerOrder.order),
          status: OrderStatus.processing,
        },
      }),
      this.prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: OrderStatus.processing,
          message: "Order submitted to provider successfully.",
          metadata: {
            providerOrderId: String(providerOrder.order),
          },
        },
      }),
      this.prisma.queueJobLog.create({
        data: {
          queueName: ORDER_SUBMIT_QUEUE,
          jobName: ORDER_SUBMIT_JOB,
          status: "completed",
          payload: {
            orderId: order.id,
            providerOrderId: String(providerOrder.order),
          },
        },
      }),
    ]);

    await this.orderStatusQueue.add(
      ORDER_STATUS_UPDATE_JOB,
      { orderId: order.id },
      {
        jobId: `status:${order.id}:${Date.now()}`,
        delay: 30_000,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 5_000,
        },
      }
    );
  }
}
