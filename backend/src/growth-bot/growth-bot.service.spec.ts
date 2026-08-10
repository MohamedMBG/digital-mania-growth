import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import {
  GrowthAccountType,
  GrowthPlatform,
  GrowthQuoteStatus,
  GrowthRequestStatus,
  GrowthTimeframe,
  Prisma,
} from "@prisma/client";
import { AppLogger } from "src/common/logger/app-logger.service";
import { OrdersService } from "src/orders/orders.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import { GrowthBotService } from "./growth-bot.service";

const request = {
  id: "req-1",
  userId: "user-1",
  accountType: GrowthAccountType.creator,
  platform: GrowthPlatform.instagram,
  profile: "@brand",
  currentAudience: 2450,
  targetAudience: 10000,
  timeframe: GrowthTimeframe.three_months,
  niche: null,
  companyName: null,
  website: null,
  industry: null,
  targetMarket: null,
  country: null,
  contactName: "Sam Rider",
  email: "c@x.com",
  phone: null,
  status: GrowthRequestStatus.submitted,
  internalNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const service = {
  id: "ig-followers-1",
  name: "Instagram Followers",
  pricePerK: new Prisma.Decimal("4.99"),
  minOrder: 100,
  maxOrder: 100000,
  deliverySpeed: "0-2 hours",
  refillPolicy: "Auto-refill for 30 days",
  providerServiceId: "1001",
};

const quote = {
  id: "quote-1",
  requestId: "req-1",
  serviceId: "ig-followers-1",
  quantity: 7550,
  unitPricePerK: new Prisma.Decimal("4.99"),
  total: new Prisma.Decimal("37.67"),
  currency: "USD",
  targetUrl: "https://instagram.com/brand",
  status: GrowthQuoteStatus.quoted,
  orderId: null,
  failureReason: null,
  confirmedAt: null,
  orderedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  service,
};

function createMockPrisma() {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: "bot-1" }),
      create: jest.fn().mockResolvedValue({ id: "bot-1" }),
    },
    growthRequest: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ ...request, ticket: { id: "ticket-1" } }),
      update: jest.fn().mockResolvedValue(request),
    },
    growthQuote: {
      create: jest.fn().mockResolvedValue(quote),
      findFirst: jest.fn().mockResolvedValue(quote),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(quote),
    },
    ticket: {
      findUnique: jest.fn().mockResolvedValue({
        id: "ticket-1",
        growthRequestId: "req-1",
        userId: "user-1",
      }),
      update: jest.fn().mockResolvedValue({ id: "ticket-1" }),
    },
    ticketMessage: {
      create: jest.fn().mockResolvedValue({ id: "msg-1" }),
    },
    service: {
      findFirst: jest.fn().mockResolvedValue(service),
    },
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation((arg: unknown) =>
    Array.isArray(arg)
      ? Promise.all(arg)
      : (arg as (tx: unknown) => unknown)(prisma)
  );

  return prisma;
}

const config: Record<string, unknown> = {
  "growthBot.name": "TrendK Assistant",
  "growthBot.email": "assistant@trendk.com",
  "growthBot.markupPercent": 0,
};

describe("GrowthBotService", () => {
  let bot: GrowthBotService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let wallet: { ensureWalletForUser: jest.Mock };
  let orders: { createOrder: jest.Mock };

  const lastMessage = () => {
    const calls = prisma.ticketMessage.create.mock.calls;
    return calls.length
      ? (calls[calls.length - 1][0] as { data: { body: string; isBot: boolean } })
      : null;
  };

  const setBalance = (balance: string) =>
    wallet.ensureWalletForUser.mockResolvedValue({
      id: "wallet-1",
      userId: "user-1",
      balance: new Prisma.Decimal(balance),
      currency: "USD",
    });

  beforeEach(async () => {
    prisma = createMockPrisma();
    wallet = { ensureWalletForUser: jest.fn() };
    orders = {
      createOrder: jest.fn().mockResolvedValue({ data: { id: "order-1" } }),
    };
    setBalance("0");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrowthBotService,
        { provide: PrismaService, useValue: prisma },
        { provide: WalletService, useValue: wallet },
        { provide: OrdersService, useValue: orders },
        { provide: ConfigService, useValue: { get: (k: string) => config[k] } },
        { provide: AppLogger, useValue: { error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile();

    bot = module.get(GrowthBotService);
  });

  describe("onGoalSubmitted", () => {
    it("quotes the gap between the current and target audience", async () => {
      await bot.onGoalSubmitted("req-1");

      const created = prisma.growthQuote.create.mock.calls[0][0] as {
        data: { quantity: number; total: Prisma.Decimal; targetUrl: string };
      };

      expect(created.data.quantity).toBe(7550);
      expect(created.data.total.toString()).toBe("37.67");
      expect(created.data.targetUrl).toBe("https://instagram.com/brand");
      expect(lastMessage()?.data.isBot).toBe(true);
    });

    it("hands the goal to a human when the platform has no service", async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await bot.onGoalSubmitted("req-1");

      expect(prisma.growthQuote.create).not.toHaveBeenCalled();
      expect(lastMessage()?.data.body).toContain("needs a person to price it");
    });
  });

  describe("onCustomerMessage", () => {
    it("orders immediately when the wallet already covers the quote", async () => {
      setBalance("100");

      await bot.onCustomerMessage("ticket-1", "confirm");

      expect(orders.createOrder).toHaveBeenCalledWith("user-1", {
        serviceId: "ig-followers-1",
        quantity: 7550,
        targetUrl: "https://instagram.com/brand",
        notes: expect.stringContaining("req-1"),
      });
      expect(lastMessage()?.data.body).toContain("Paid and sent to production");
    });

    it("waits for payment instead of ordering on an empty wallet", async () => {
      setBalance("10");

      await bot.onCustomerMessage("ticket-1", "confirm");

      expect(orders.createOrder).not.toHaveBeenCalled();
      expect(prisma.growthQuote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: GrowthQuoteStatus.awaiting_payment,
          }),
        })
      );
      expect(lastMessage()?.data.body).toContain("USD 27.67");
    });

    it("escalates to a human on request without touching the quote", async () => {
      await bot.onCustomerMessage("ticket-1", "can I talk to a human?");

      expect(orders.createOrder).not.toHaveBeenCalled();
      expect(lastMessage()?.data.body).toContain("flagged this thread for the team");
    });

    it("repeats the price when asked", async () => {
      await bot.onCustomerMessage("ticket-1", "how much is it?");

      expect(orders.createOrder).not.toHaveBeenCalled();
      expect(lastMessage()?.data.body).toContain("USD 37.67");
    });

    it("cancels the quote on request", async () => {
      await bot.onCustomerMessage("ticket-1", "cancel please");

      expect(prisma.growthQuote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GrowthQuoteStatus.cancelled },
        })
      );
    });

    it("quotes on the spot when the thread has no quote yet", async () => {
      prisma.growthQuote.findFirst.mockResolvedValue(null);

      await bot.onCustomerMessage("ticket-1", "hello?");

      expect(prisma.growthQuote.create).toHaveBeenCalledTimes(1);
      expect(lastMessage()?.data.body).toContain("Price: USD 37.67");
    });

    it("re-quotes a cancelled goal instead of stalling", async () => {
      prisma.growthQuote.findFirst.mockResolvedValue({
        ...quote,
        status: GrowthQuoteStatus.cancelled,
      });

      await bot.onCustomerMessage("ticket-1", "are you still there?");

      expect(prisma.growthQuote.create).toHaveBeenCalledTimes(1);
    });

    it("re-quotes when the customer names a new number", async () => {
      await bot.onCustomerMessage("ticket-1", "actually make it 50k");

      expect(prisma.growthRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { targetAudience: 50000 } })
      );
      expect(prisma.growthQuote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GrowthQuoteStatus.cancelled },
        })
      );
      expect(prisma.growthQuote.create).toHaveBeenCalledTimes(1);
    });

    it("reads a confirmation with a number in it as agreement", async () => {
      setBalance("100");

      await bot.onCustomerMessage("ticket-1", "confirm the 37.67 please");

      expect(orders.createOrder).toHaveBeenCalledTimes(1);
      expect(prisma.growthQuote.create).not.toHaveBeenCalled();
    });

    it("never re-orders a quote that already went to production", async () => {
      prisma.growthQuote.findFirst.mockResolvedValue({
        ...quote,
        status: GrowthQuoteStatus.ordered,
      });

      await bot.onCustomerMessage("ticket-1", "confirm");

      expect(orders.createOrder).not.toHaveBeenCalled();
    });

    it("ignores tickets that are not goal threads", async () => {
      prisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-9",
        growthRequestId: null,
        userId: "user-1",
      });

      await bot.onCustomerMessage("ticket-9", "confirm");

      expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
    });
  });

  describe("onWalletFunded", () => {
    it("places the order for a confirmed quote once the money lands", async () => {
      prisma.growthQuote.findMany.mockResolvedValue([
        { ...quote, status: GrowthQuoteStatus.awaiting_payment },
      ]);
      setBalance("100");

      await bot.onWalletFunded("user-1");

      expect(orders.createOrder).toHaveBeenCalledTimes(1);
      expect(lastMessage()?.data.body).toContain("Paid and sent to production");
    });

    it("leaves the quote parked when the top-up is still short", async () => {
      prisma.growthQuote.findMany.mockResolvedValue([
        { ...quote, status: GrowthQuoteStatus.awaiting_payment },
      ]);
      setBalance("5");

      await bot.onWalletFunded("user-1");

      expect(orders.createOrder).not.toHaveBeenCalled();
    });

    it("marks the quote failed when the order cannot be placed", async () => {
      prisma.growthQuote.findMany.mockResolvedValue([
        { ...quote, status: GrowthQuoteStatus.awaiting_payment },
      ]);
      setBalance("100");
      orders.createOrder.mockRejectedValue(new Error("provider down"));

      await bot.onWalletFunded("user-1");

      expect(prisma.growthQuote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: GrowthQuoteStatus.failed,
            failureReason: "provider down",
          },
        })
      );
      expect(lastMessage()?.data.body).toContain("couldn't place the order");
    });
  });
});
