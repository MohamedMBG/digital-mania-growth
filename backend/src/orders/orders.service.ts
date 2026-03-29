import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { OrderStatus, Prisma, WalletTransactionType } from "@prisma/client";
import { Queue } from "bullmq";
import { buildPaginationMeta } from "src/common/utils/pagination";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import {
  ORDER_STATUS_UPDATE_QUEUE,
  ORDER_SUBMIT_JOB,
  ORDER_SUBMIT_QUEUE,
} from "./orders.constants";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ListOrdersQueryDto } from "./dto/list-orders-query.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    @InjectQueue(ORDER_SUBMIT_QUEUE) private readonly orderSubmitQueue: Queue,
    @InjectQueue(ORDER_STATUS_UPDATE_QUEUE) private readonly orderStatusQueue: Queue
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        isActive: true,
        platform: { isActive: true },
        category: { isActive: true },
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found.");
    }

    if (!service.providerServiceId) {
      throw new BadRequestException("This service is not configured for provider ordering yet.");
    }

    if (dto.quantity < service.minOrder || dto.quantity > service.maxOrder) {
      throw new BadRequestException(
        `Quantity must be between ${service.minOrder} and ${service.maxOrder}.`
      );
    }

    const chargeAmount = this.calculateOrderCharge(
      dto.quantity,
      service.pricePerK.toNumber()
    );

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const wallet = await this.walletService.ensureWalletForUser(userId, tx);

      const chargeDecimal = new Prisma.Decimal(chargeAmount.toFixed(2));

      const order = await tx.order.create({
        data: {
          userId,
          serviceId: service.id,
          quantity: dto.quantity,
          chargeAmount: chargeDecimal,
          currency: wallet.currency,
          targetUrl: dto.targetUrl,
          status: OrderStatus.pending,
          providerServiceId: service.providerServiceId,
          remains: dto.quantity,
          notes: dto.notes,
        },
      });

      await this.walletService.deductWallet(
        {
          userId,
          amount: chargeAmount,
          currency: wallet.currency,
          reference: order.id,
          type: WalletTransactionType.charge,
          description: `Wallet charged for order ${order.id}`,
          metadata: {
            orderId: order.id,
            serviceId: service.id,
            quantity: dto.quantity,
          },
        },
        tx
      );

      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: OrderStatus.pending,
          message: "Order created and awaiting provider queue dispatch.",
          metadata: {
            providerServiceId: service.providerServiceId,
            targetUrl: dto.targetUrl,
          },
        },
      });

      return order;
    });

    try {
      await this.orderSubmitQueue.add(
        ORDER_SUBMIT_JOB,
        {
          orderId: createdOrder.id,
          userId,
          serviceId: service.id,
          providerServiceId: service.providerServiceId,
        },
        {
          jobId: createdOrder.id,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 5_000,
          },
        }
      );
    } catch {
      await this.rollbackUnqueuedOrder(createdOrder.id, userId, chargeAmount);
      throw new BadGatewayException(
        "Order could not be queued for processing. Your wallet balance was restored."
      );
    }

    return this.getOrderById(userId, createdOrder.id, "Order created successfully.");
  }

  async listOrders(userId: string, query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const normalizedStatus = this.parseOrderStatus(query.status);

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
              platform: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: "Orders loaded successfully.",
      data: items.map((order) => this.serializeOrder(order)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getOrderById(userId: string, orderId: string, message = "Order loaded successfully.") {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            platform: {
              select: {
                name: true,
                slug: true,
              },
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        statusLogs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return {
      success: true,
      message,
      data: this.serializeOrder(order),
    };
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    const cancellableStatuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.queued];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException("Only pending or queued orders can be canceled.");
    }

    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      const updatedOrders = await tx.order.updateMany({
        where: {
          id: order.id,
          userId,
          status: {
            in: cancellableStatuses,
          },
        },
        data: {
          status: OrderStatus.canceled,
          canceledAt: new Date(),
          remains: 0,
        },
      });

      if (updatedOrders.count === 0) {
        throw new BadRequestException("Order has already been canceled.");
      }

      await this.walletService.creditWallet(
        {
          userId,
          amount: order.chargeAmount.toNumber(),
          currency: order.currency,
          reference: order.id,
          type: WalletTransactionType.refund,
          description: `Wallet refunded for canceled order ${order.id}`,
          metadata: {
            orderId: order.id,
          },
        },
        tx
      );

      const updatedOrder = await tx.order.findUnique({
        where: { id: order.id },
      });

      if (!updatedOrder) {
        throw new NotFoundException("Order not found.");
      }

      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: OrderStatus.canceled,
          message: "Order canceled and wallet refunded.",
        },
      });

      return updatedOrder;
    });

    await this.orderSubmitQueue.remove(order.id).catch(() => undefined);
    await this.removeQueuedStatusJobs(order.id);

    return this.getOrderById(userId, cancelledOrder.id, "Order canceled successfully.");
  }

  private async rollbackUnqueuedOrder(orderId: string, userId: string, chargeAmount: number) {
    const amount = new Prisma.Decimal(chargeAmount.toFixed(2));

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order || order.status !== OrderStatus.pending) {
        return;
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.failed,
          canceledAt: new Date(),
          remains: 0,
        },
      });

      await this.walletService.creditWallet(
        {
          userId,
          amount: amount.toNumber(),
          reference: orderId,
          type: WalletTransactionType.refund,
          description: `Wallet refunded because queueing failed for order ${orderId}`,
          metadata: {
            orderId,
            reason: "queue_failure",
          },
        },
        tx
      );

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: OrderStatus.failed,
          message: "Order queue dispatch failed. Wallet refunded automatically.",
        },
      });
    });
  }

  private calculateOrderCharge(quantity: number, pricePerK: number) {
    return Number(((quantity / 1000) * pricePerK).toFixed(2));
  }

  private async removeQueuedStatusJobs(orderId: string) {
    const jobs = await this.orderStatusQueue.getJobs([
      "waiting",
      "delayed",
      "prioritized",
      "paused",
    ]);

    await Promise.all(
      jobs
        .filter((job) => job.data?.orderId === orderId)
        .map((job) => job.remove().catch(() => undefined))
    );
  }

  private parseOrderStatus(status?: string): OrderStatus | undefined {
    if (!status) {
      return undefined;
    }

    if ((Object.values(OrderStatus) as string[]).includes(status)) {
      return status as OrderStatus;
    }

    throw new BadRequestException("Invalid order status.");
  }

  private serializeOrder(order: {
    id: string;
    quantity: number;
    chargeAmount: { toNumber(): number };
    currency: string;
    targetUrl: string;
    status: OrderStatus;
    providerServiceId: string | null;
    providerOrderId: string | null;
    startCount: number | null;
    remains: number | null;
    notes: string | null;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    service?: Record<string, unknown>;
    statusLogs?: Array<{
      id: string;
      status: OrderStatus;
      message: string | null;
      metadata: Prisma.JsonValue | null;
      createdAt: Date;
    }>;
  }) {
    return {
      ...order,
      chargeAmount: order.chargeAmount.toNumber(),
    };
  }
}
