import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { OrderStatus, Prisma, WalletTransactionType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import { ProviderService } from "src/provider/provider.service";
import { OutboxService } from "src/infrastructure/outbox/outbox.service";
import { OrdersService } from "./orders.service";
import {
  ORDER_STATUS_UPDATE_QUEUE,
  ORDER_SUBMIT_QUEUE,
} from "./orders.constants";

const mockService = {
  id: "svc-1",
  platformId: "plat-1",
  categoryId: "cat-1",
  name: "Test Service",
  slug: "test-service",
  providerServiceId: "prov-100",
  description: "Test",
  shortDescription: null,
  pricePerK: new Prisma.Decimal("5.00"),
  minOrder: 100,
  maxOrder: 10000,
  deliverySpeed: null,
  guarantee: null,
  refillPolicy: null,
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  platform: { id: "plat-1", name: "Instagram", slug: "instagram" },
  category: { id: "cat-1", name: "Followers", slug: "followers" },
};

const mockOrder = {
  id: "order-1",
  userId: "user-1",
  serviceId: "svc-1",
  quantity: 1000,
  chargeAmount: new Prisma.Decimal("5.00"),
  currency: "USD",
  targetUrl: "https://instagram.com/test",
  status: OrderStatus.pending,
  providerServiceId: "prov-100",
  providerOrderId: null,
  startCount: null,
  remains: 1000,
  notes: null,
  canceledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockPrisma() {
  const txClient = {
    order: {
      create: jest.fn().mockResolvedValue(mockOrder),
      findUnique: jest.fn().mockResolvedValue(mockOrder),
      findFirst: jest.fn().mockResolvedValue(mockOrder),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue(mockOrder),
    },
    orderStatusLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    walletTransaction: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    queueJobLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    outboxEvent: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  return {
    service: {
      findFirst: jest.fn().mockResolvedValue(mockService),
    },
    order: {
      findFirst: jest.fn().mockResolvedValue(mockOrder),
      findMany: jest.fn().mockResolvedValue([mockOrder]),
      findUnique: jest.fn().mockResolvedValue(mockOrder),
      count: jest.fn().mockResolvedValue(1),
    },
    $transaction: jest.fn((fn: (tx: typeof txClient) => Promise<unknown>) => fn(txClient)),
    _txClient: txClient,
  };
}

function createMockQueue() {
  return {
    add: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue(undefined),
    getJobs: jest.fn().mockResolvedValue([]),
  };
}

describe("OrdersService", () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let walletService: { deductWallet: jest.Mock; creditWallet: jest.Mock; ensureWalletForUser: jest.Mock };
  let outboxService: { enqueue: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrisma();
    walletService = {
      deductWallet: jest.fn().mockResolvedValue({ wallet: {}, transaction: {} }),
      creditWallet: jest.fn().mockResolvedValue({ wallet: {}, transaction: {} }),
      ensureWalletForUser: jest.fn().mockResolvedValue({
        id: "wallet-1",
        userId: "user-1",
        balance: new Prisma.Decimal("100.00"),
        currency: "USD",
      }),
    };
    outboxService = {
      enqueue: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: WalletService, useValue: walletService },
        { provide: ProviderService, useValue: {} },
        { provide: OutboxService, useValue: outboxService },
        { provide: getQueueToken(ORDER_SUBMIT_QUEUE), useValue: createMockQueue() },
        { provide: getQueueToken(ORDER_STATUS_UPDATE_QUEUE), useValue: createMockQueue() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe("createOrder", () => {
    it("should create order, charge wallet, and enqueue outbox event", async () => {
      const result = await service.createOrder("user-1", {
        serviceId: "svc-1",
        quantity: 1000,
        targetUrl: "https://instagram.com/test",
      });

      expect(result.success).toBe(true);
      expect(walletService.deductWallet).toHaveBeenCalled();
      expect(outboxService.enqueue).toHaveBeenCalled();
      expect(prisma._txClient.orderStatusLog.create).toHaveBeenCalled();
    });

    it("should reject when service not found", async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.createOrder("user-1", {
          serviceId: "nonexistent",
          quantity: 100,
          targetUrl: "https://example.com",
        })
      ).rejects.toThrow(NotFoundException);
    });

    it("should reject when service has no providerServiceId", async () => {
      prisma.service.findFirst.mockResolvedValue({
        ...mockService,
        providerServiceId: null,
      });

      await expect(
        service.createOrder("user-1", {
          serviceId: "svc-1",
          quantity: 100,
          targetUrl: "https://example.com",
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject quantity below minimum", async () => {
      await expect(
        service.createOrder("user-1", {
          serviceId: "svc-1",
          quantity: 10,
          targetUrl: "https://example.com",
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject quantity above maximum", async () => {
      await expect(
        service.createOrder("user-1", {
          serviceId: "svc-1",
          quantity: 99999,
          targetUrl: "https://example.com",
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel pending order and refund wallet", async () => {
      prisma.order.findFirst.mockResolvedValue({ ...mockOrder, status: OrderStatus.pending });
      prisma._txClient.order.findFirst?.mockResolvedValue?.({
        ...mockOrder,
        status: OrderStatus.pending,
      });

      const result = await service.cancelOrder("user-1", "order-1");

      expect(result.success).toBe(true);
      expect(prisma._txClient.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.canceled }),
        })
      );
    });

    it("should reject cancellation of processing order", async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.processing,
      });

      await expect(
        service.cancelOrder("user-1", "order-1")
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject cancellation of already canceled order", async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.canceled,
      });

      await expect(
        service.cancelOrder("user-1", "order-1")
      ).rejects.toThrow(BadRequestException);
    });

    it("should not double-refund if refund already exists", async () => {
      prisma.order.findFirst.mockResolvedValue({ ...mockOrder, status: OrderStatus.pending });
      prisma._txClient.walletTransaction.findFirst.mockResolvedValue({
        id: "existing-refund",
        type: WalletTransactionType.refund,
      });

      await service.cancelOrder("user-1", "order-1");

      expect(walletService.creditWallet).not.toHaveBeenCalled();
    });

    it("should throw when order not found", async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelOrder("user-1", "nonexistent")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("listOrders", () => {
    it("should return paginated orders", async () => {
      const result = await service.listOrders("user-1", {});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta).toBeDefined();
    });

    it("should reject invalid status filter", async () => {
      await expect(
        service.listOrders("user-1", { status: "invalid_status" })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getOrderById", () => {
    it("should return order when found", async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        service: mockService,
        statusLogs: [],
      });

      const result = await service.getOrderById("user-1", "order-1");

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("order-1");
    });

    it("should throw when order belongs to different user", async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrderById("other-user", "order-1")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("handleSubmissionFailure", () => {
    it("should mark order as failed and refund wallet", async () => {
      prisma._txClient.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.queued,
      });
      prisma._txClient.walletTransaction.findFirst.mockResolvedValue(null);

      await service.handleSubmissionFailure("order-1", "Provider timeout");

      expect(prisma._txClient.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.failed }),
        })
      );
      expect(walletService.creditWallet).toHaveBeenCalled();
    });

    it("should skip refund if already refunded", async () => {
      prisma._txClient.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.queued,
      });
      prisma._txClient.walletTransaction.findFirst.mockResolvedValue({
        id: "existing-refund",
      });

      await service.handleSubmissionFailure("order-1", "Provider timeout");

      expect(walletService.creditWallet).not.toHaveBeenCalled();
    });

    it("should skip if order already in terminal state", async () => {
      prisma._txClient.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.completed,
      });

      await service.handleSubmissionFailure("order-1", "Provider timeout");

      expect(prisma._txClient.order.update).not.toHaveBeenCalled();
    });
  });
});
