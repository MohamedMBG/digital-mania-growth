import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma, WalletTransactionType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "./wallet.service";

const mockWallet = {
  id: "wallet-1",
  userId: "user-1",
  balance: new Prisma.Decimal("100.00"),
  currency: "USD",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockPrisma() {
  const txClient = {
    wallet: {
      upsert: jest.fn().mockResolvedValue(mockWallet),
      findUnique: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn().mockResolvedValue({ id: "tx-1" }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn(),
  };

  return {
    wallet: {
      upsert: jest.fn().mockResolvedValue(mockWallet),
      findUnique: jest.fn(),
    },
    walletTransaction: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn((fn: (tx: typeof txClient) => Promise<unknown>) => fn(txClient)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    _txClient: txClient,
  };
}

describe("WalletService", () => {
  let service: WalletService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe("ensureWalletForUser", () => {
    it("should upsert and return wallet", async () => {
      const result = await service.ensureWalletForUser("user-1");
      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.upsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        update: {},
        create: { userId: "user-1" },
      });
    });
  });

  describe("getWallet", () => {
    it("should return wallet with balance as number", async () => {
      prisma.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        _count: { transactions: 5 },
      });

      const result = await service.getWallet("user-1");

      expect(result.success).toBe(true);
      expect(result.data.balance).toBe(100);
      expect(result.data.transactionCount).toBe(5);
    });

    it("should throw NotFoundException when wallet vanishes", async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);

      await expect(service.getWallet("user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("creditWallet", () => {
    it("should update balance and create transaction", async () => {
      prisma._txClient.$queryRaw.mockResolvedValue([
        {
          balance_before: new Prisma.Decimal("100.00"),
          balance_after: new Prisma.Decimal("150.00"),
        },
      ]);

      const result = await service.creditWallet({
        userId: "user-1",
        amount: 50,
        type: WalletTransactionType.deposit,
        description: "Test deposit",
      });

      expect(result.transaction).toBeDefined();
      expect(prisma._txClient.$queryRaw).toHaveBeenCalled();
      expect(prisma._txClient.walletTransaction.create).toHaveBeenCalled();
    });

    it("should reject zero amount", async () => {
      await expect(
        service.creditWallet({
          userId: "user-1",
          amount: 0,
          type: WalletTransactionType.deposit,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject negative amount", async () => {
      await expect(
        service.creditWallet({
          userId: "user-1",
          amount: -10,
          type: WalletTransactionType.deposit,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject NaN amount", async () => {
      await expect(
        service.creditWallet({
          userId: "user-1",
          amount: NaN,
          type: WalletTransactionType.deposit,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject Infinity amount", async () => {
      await expect(
        service.creditWallet({
          userId: "user-1",
          amount: Infinity,
          type: WalletTransactionType.deposit,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("deductWallet", () => {
    it("should deduct balance when sufficient funds", async () => {
      prisma._txClient.$queryRaw.mockResolvedValue([
        {
          balance_before: new Prisma.Decimal("100.00"),
          balance_after: new Prisma.Decimal("70.00"),
        },
      ]);

      const result = await service.deductWallet({
        userId: "user-1",
        amount: 30,
        type: WalletTransactionType.charge,
        description: "Test charge",
      });

      expect(result.transaction).toBeDefined();
    });

    it("should throw BadRequestException on insufficient balance", async () => {
      prisma._txClient.$queryRaw.mockResolvedValue([]);

      await expect(
        service.deductWallet({
          userId: "user-1",
          amount: 500,
          type: WalletTransactionType.charge,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject zero amount", async () => {
      await expect(
        service.deductWallet({
          userId: "user-1",
          amount: 0,
          type: WalletTransactionType.charge,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getTransactions", () => {
    it("should return paginated transactions", async () => {
      prisma.walletTransaction.findMany.mockResolvedValue([]);
      prisma.walletTransaction.count.mockResolvedValue(0);

      const result = await service.getTransactions("user-1", {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(1);
    });

    it("should reject invalid transaction type", async () => {
      await expect(
        service.getTransactions("user-1", { type: "invalid" })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
