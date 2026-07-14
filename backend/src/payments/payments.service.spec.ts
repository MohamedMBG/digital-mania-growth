import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PaymentStatus, Prisma } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import { PaymentsService } from "./payments.service";

// ponytail: stripe mocked at module level so no network/secret needed; var must be
// `mock`-prefixed because jest hoists jest.mock above imports.
const mockConstructEvent = jest.fn();
jest.mock("stripe", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    checkout: { sessions: { create: jest.fn() } },
  })),
}));

const mockPayment = {
  id: "pay-1",
  walletId: "wallet-1",
  amount: new Prisma.Decimal("50.00"),
  currency: "usd",
  metadata: {},
  creditedAt: null as Date | null,
};

function createMockPrisma() {
  const txClient = {
    payment: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  return {
    payment: {
      findUnique: jest.fn().mockResolvedValue({ ...mockPayment }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn((fn: (tx: typeof txClient) => Promise<unknown>) => fn(txClient)),
    _txClient: txClient,
  };
}

function createMockWallet() {
  return {
    getWalletRecordById: jest
      .fn()
      .mockResolvedValue({ id: "wallet-1", userId: "user-1", currency: "usd" }),
    creditWallet: jest.fn().mockResolvedValue({ transaction: { id: "tx-1" } }),
    ensureWalletForUser: jest.fn(),
  };
}

const config: Record<string, string> = {
  "stripe.secretKey": "sk_test_x",
  "stripe.webhookSecret": "whsec_x",
  "stripe.currency": "usd",
};

describe("PaymentsService.processWebhook", () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let wallet: ReturnType<typeof createMockWallet>;

  beforeEach(async () => {
    mockConstructEvent.mockReset();
    prisma = createMockPrisma();
    wallet = createMockWallet();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: WalletService, useValue: wallet },
        {
          provide: ConfigService,
          useValue: { getOrThrow: (k: string) => config[k] },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  const session = { id: "cs_1", payment_intent: "pi_1", payment_status: "paid" };

  it("rejects missing signature or body", async () => {
    await expect(service.processWebhook(undefined, Buffer.from("x"))).rejects.toThrow(
      BadRequestException
    );
    await expect(service.processWebhook("sig", undefined)).rejects.toThrow(
      BadRequestException
    );
  });

  it("rejects an invalid Stripe signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });

    await expect(
      service.processWebhook("sig", Buffer.from("payload"))
    ).rejects.toThrow(UnauthorizedException);
  });

  it("credits the wallet once on checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    await service.processWebhook("sig", Buffer.from("payload"));

    expect(prisma._txClient.payment.updateMany).toHaveBeenCalledTimes(1);
    expect(wallet.creditWallet).toHaveBeenCalledTimes(1);
    expect(wallet.creditWallet.mock.calls[0][0].amount).toBe(50);
  });

  it("does not double-credit an already-credited payment", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...mockPayment,
      creditedAt: new Date(),
    });
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    await service.processWebhook("sig", Buffer.from("payload"));

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(wallet.creditWallet).not.toHaveBeenCalled();
  });

  it("does not credit when a concurrent webhook already claimed the row", async () => {
    // Row passed the creditedAt=null read, but the atomic updateMany claimed 0.
    prisma._txClient.payment.updateMany.mockResolvedValue({ count: 0 });
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    await service.processWebhook("sig", Buffer.from("payload"));

    expect(wallet.creditWallet).not.toHaveBeenCalled();
  });

  it("throws when no payment record matches the session", async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    await expect(
      service.processWebhook("sig", Buffer.from("payload"))
    ).rejects.toThrow(NotFoundException);
  });

  it("marks the payment canceled on checkout.session.expired", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.expired",
      data: { object: session },
    });

    await service.processWebhook("sig", Buffer.from("payload"));

    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: PaymentStatus.canceled }) })
    );
    expect(wallet.creditWallet).not.toHaveBeenCalled();
  });

  it("marks the payment failed on async_payment_failed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.async_payment_failed",
      data: { object: session },
    });

    await service.processWebhook("sig", Buffer.from("payload"));

    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: PaymentStatus.failed }) })
    );
  });

  it("ignores unhandled event types without touching the wallet", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: session },
    });

    const result = await service.processWebhook("sig", Buffer.from("payload"));

    expect(result).toEqual({ received: true });
    expect(wallet.creditWallet).not.toHaveBeenCalled();
    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
  });
});
