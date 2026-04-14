import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { Job, Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { ProviderService } from "src/provider/provider.service";
import { OrdersService } from "./orders.service";
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
    private readonly ordersService: OrdersService,
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

    const isQueueableOrderStatus =
      order.status === OrderStatus.pending || order.status === OrderStatus.queued;

    if (!isQueueableOrderStatus || !order.providerServiceId) {
      return;
    }

    const providerOrder = await this.providerService.createOrder({
      service: order.providerServiceId,
      link: order.targetUrl,
      quantity: order.quantity,
    });

    await this.prisma.$transaction(async (tx) => {
      if (order.status === OrderStatus.pending) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.queued,
          },
        });

        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            status: OrderStatus.queued,
            message: "Order queued for provider submission.",
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          providerOrderId: String(providerOrder.order),
          status: OrderStatus.processing,
        },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: OrderStatus.processing,
          message: "Order submitted to provider successfully.",
          metadata: {
            providerOrderId: String(providerOrder.order),
          },
        },
      });

      await tx.queueJobLog.create({
        data: {
          queueName: ORDER_SUBMIT_QUEUE,
          jobName: ORDER_SUBMIT_JOB,
          status: "completed",
          payload: {
            orderId: order.id,
            providerOrderId: String(providerOrder.order),
          },
        },
      });
    });

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

  @OnWorkerEvent("failed")
  async onFailed(job: Job<OrderSubmitJobData>, error: Error) {
    if (job.name !== ORDER_SUBMIT_JOB) {
      return;
    }

    const maxAttempts =
      typeof job.opts.attempts === "number" && job.opts.attempts > 0
        ? job.opts.attempts
        : 1;
    const attemptsMade = job.attemptsMade ?? 0;

    if (attemptsMade < maxAttempts) {
      return;
    }

    await this.ordersService.handleSubmissionFailure(
      job.data.orderId,
      error.message || "Provider submission failed."
    );
  }
}
