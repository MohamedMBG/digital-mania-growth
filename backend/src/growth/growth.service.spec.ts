import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
  GrowthAccountType,
  GrowthPlanStatus,
  GrowthPlatform,
  GrowthRequestStatus,
  GrowthTimeframe,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { GrowthBotService } from "src/growth-bot/growth-bot.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GrowthService } from "./growth.service";

const customer: AuthenticatedUser = {
  id: "user-1",
  email: "c@x.com",
  role: UserRole.customer,
  fullName: null,
  isActive: true,
};

const otherCustomer: AuthenticatedUser = { ...customer, id: "user-2" };

const admin: AuthenticatedUser = {
  id: "admin-1",
  email: "a@x.com",
  role: UserRole.admin,
  fullName: null,
  isActive: true,
};

const baseRequest = {
  id: "req-1",
  userId: "user-1",
  accountType: GrowthAccountType.creator,
  platform: GrowthPlatform.instagram,
  profile: "@brand",
  currentAudience: 2450,
  targetAudience: 10000,
  timeframe: GrowthTimeframe.six_months,
  niche: null,
  companyName: null,
  website: null,
  industry: null,
  targetMarket: null,
  country: null,
  contactName: "Sam",
  email: "c@x.com",
  phone: null,
  status: GrowthRequestStatus.submitted,
  internalNotes: "internal only",
  createdAt: new Date(),
  updatedAt: new Date(),
  plan: null,
  progressSnapshots: [],
};

const draftPlan = {
  id: "plan-1",
  requestId: "req-1",
  title: "Draft",
  summary: "s",
  strategy: "st",
  components: [],
  estimatedTimeline: null,
  price: null,
  currency: "USD",
  notes: null,
  status: GrowthPlanStatus.draft,
  sharedAt: null,
  respondedAt: null,
  customerNote: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockPrisma() {
  const prisma = {
    growthRequest: {
      create: jest.fn().mockResolvedValue(baseRequest),
      findUnique: jest.fn().mockResolvedValue(baseRequest),
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        ...baseRequest,
        ticket: { id: "ticket-1", status: "open" },
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue(baseRequest),
    },
    growthPlan: {
      upsert: jest.fn().mockResolvedValue(draftPlan),
      update: jest.fn().mockResolvedValue(draftPlan),
    },
    growthProgressSnapshot: {
      create: jest.fn().mockResolvedValue({ id: "snap-1" }),
    },
    ticket: {
      create: jest.fn().mockResolvedValue({ id: "ticket-1" }),
      update: jest.fn().mockResolvedValue({ id: "ticket-1" }),
    },
    ticketMessage: {
      create: jest.fn().mockResolvedValue({ id: "msg-1" }),
    },
    adminActionLog: {
      create: jest.fn().mockResolvedValue({ id: "log-1" }),
    },
    $transaction: jest.fn(),
  };

  // Interactive transactions run against the same mock so call assertions work.
  prisma.$transaction.mockImplementation((arg: unknown) =>
    Array.isArray(arg)
      ? Promise.all(arg)
      : (arg as (tx: unknown) => unknown)(prisma)
  );

  return prisma;
}

describe("GrowthService", () => {
  let service: GrowthService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let growthBot: { onGoalSubmitted: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrisma();
    growthBot = { onGoalSubmitted: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrowthService,
        { provide: PrismaService, useValue: prisma },
        { provide: GrowthBotService, useValue: growthBot },
      ],
    }).compile();
    service = module.get(GrowthService);
  });

  describe("createRequest", () => {
    it("stores an anonymous request when there is no user", async () => {
      const result = await service.createRequest({
        platform: GrowthPlatform.instagram,
        profile: "@brand",
        currentAudience: 2450,
        targetAudience: 10000,
        contactName: "Sam",
        email: "C@X.com",
      });

      expect(result.success).toBe(true);
      expect(prisma.growthRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: null, email: "c@x.com" }),
        })
      );
    });

    it("opens no private thread for an anonymous request", async () => {
      await service.createRequest({
        platform: GrowthPlatform.instagram,
        profile: "@brand",
        currentAudience: 2450,
        targetAudience: 10000,
        contactName: "Sam",
        email: "c@x.com",
      });

      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });

    it("links the request to a signed-in user", async () => {
      await service.createRequest(
        {
          platform: GrowthPlatform.tiktok,
          profile: "@brand",
          currentAudience: 100,
          targetAudience: 1000,
          contactName: "Sam",
          email: "c@x.com",
        },
        customer
      );

      expect(prisma.growthRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: "user-1" }),
        })
      );
    });

    it("opens a private thread seeded with the brief for a signed-in user", async () => {
      await service.createRequest(
        {
          platform: GrowthPlatform.instagram,
          profile: "@brand",
          currentAudience: 2450,
          targetAudience: 10000,
          contactName: "Sam",
          email: "c@x.com",
        },
        customer
      );

      expect(prisma.ticket.create).toHaveBeenCalledTimes(1);
      const args = prisma.ticket.create.mock.calls[0][0] as {
        data: {
          userId: string;
          growthRequestId: string;
          subject: string;
          messages: { create: { authorId: string; isStaff: boolean; body: string } };
        };
      };

      expect(args.data.userId).toBe("user-1");
      expect(args.data.growthRequestId).toBe("req-1");
      expect(args.data.subject).toContain("10,000 followers");
      expect(args.data.messages.create.isStaff).toBe(false);
      expect(args.data.messages.create.body).toContain("Target followers: 10,000");
    });

    it("hands the new goal to the assistant so it can quote", async () => {
      await service.createRequest(
        {
          platform: GrowthPlatform.instagram,
          profile: "@brand",
          currentAudience: 2450,
          targetAudience: 10000,
          contactName: "Sam",
          email: "c@x.com",
        },
        customer
      );

      expect(growthBot.onGoalSubmitted).toHaveBeenCalledWith("req-1");
    });

    it("does not call the assistant when no thread was opened", async () => {
      prisma.growthRequest.findUniqueOrThrow.mockResolvedValue(baseRequest);

      await service.createRequest({
        platform: GrowthPlatform.instagram,
        profile: "@brand",
        currentAudience: 2450,
        targetAudience: 10000,
        contactName: "Sam",
        email: "c@x.com",
      });

      expect(growthBot.onGoalSubmitted).not.toHaveBeenCalled();
    });
  });

  describe("getRequestById", () => {
    it("hides another customer's request", async () => {
      await expect(
        service.getRequestById(otherCustomer, "req-1")
      ).rejects.toThrow(NotFoundException);
    });

    it("keeps internal notes away from the customer", async () => {
      const result = await service.getRequestById(customer, "req-1");
      expect(result.data).not.toHaveProperty("internalNotes");
    });

    it("exposes internal notes to staff", async () => {
      const result = await service.getRequestById(admin, "req-1");
      expect(result.data).toHaveProperty("internalNotes", "internal only");
    });

    it("does not expose a draft plan to the customer", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        plan: draftPlan,
      });

      const result = await service.getRequestById(customer, "req-1");
      expect(result.data.plan).toBeNull();
      expect(result.data.hasPlan).toBe(true);
    });

    it("exposes a shared plan to the customer", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        plan: { ...draftPlan, status: GrowthPlanStatus.shared },
      });

      const result = await service.getRequestById(customer, "req-1");
      expect(result.data.plan).not.toBeNull();
    });

    it("reports no current audience until a reading exists", async () => {
      const result = await service.getRequestById(customer, "req-1");
      expect(result.data.latestAudience).toBeNull();
    });

    it("uses the newest recorded reading as the current audience", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        progressSnapshots: [
          { id: "s1", audience: 3000, note: null, recordedAt: new Date("2026-01-01") },
          { id: "s2", audience: 4870, note: null, recordedAt: new Date("2026-02-01") },
        ],
      });

      const result = await service.getRequestById(customer, "req-1");
      expect(result.data.latestAudience).toBe(4870);
    });
  });

  describe("respondToPlan", () => {
    it("rejects a response when no plan has been shared", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        plan: draftPlan,
      });

      await expect(
        service.respondToPlan(customer, "req-1", { decision: "accept" })
      ).rejects.toThrow(ForbiddenException);
    });

    it("records an acceptance on a shared plan", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        plan: { ...draftPlan, status: GrowthPlanStatus.shared },
      });

      await service.respondToPlan(customer, "req-1", { decision: "accept" });

      expect(prisma.growthPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: GrowthPlanStatus.accepted }),
        })
      );
    });
  });

  describe("adminUpsertPlan", () => {
    it("does not advance the request when the plan stays a draft", async () => {
      const tx = {
        growthPlan: { upsert: jest.fn().mockResolvedValue(draftPlan) },
        growthRequest: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((arg: unknown) =>
        (arg as (t: unknown) => unknown)(tx)
      );

      await service.adminUpsertPlan(admin, "req-1", {
        title: "T",
        summary: "S",
        strategy: "St",
        status: GrowthPlanStatus.draft,
      });

      expect(tx.growthRequest.update).not.toHaveBeenCalled();
    });

    it("moves the request to plan_ready once the plan is shared", async () => {
      const tx = {
        growthPlan: { upsert: jest.fn().mockResolvedValue(draftPlan) },
        growthRequest: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((arg: unknown) =>
        (arg as (t: unknown) => unknown)(tx)
      );

      await service.adminUpsertPlan(admin, "req-1", {
        title: "T",
        summary: "S",
        strategy: "St",
        status: GrowthPlanStatus.shared,
      });

      expect(tx.growthRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GrowthRequestStatus.plan_ready },
        })
      );
    });

    it("posts the shared plan into the goal's private thread", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        ticket: { id: "ticket-1" },
      });

      await service.adminUpsertPlan(admin, "req-1", {
        title: "T",
        summary: "S",
        strategy: "St",
        status: GrowthPlanStatus.shared,
      });

      expect(prisma.ticketMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ticketId: "ticket-1",
            isStaff: true,
            authorId: "admin-1",
          }),
        })
      );
    });

    it("keeps a draft plan out of the private thread", async () => {
      prisma.growthRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        ticket: { id: "ticket-1" },
      });

      await service.adminUpsertPlan(admin, "req-1", {
        title: "T",
        summary: "S",
        strategy: "St",
        status: GrowthPlanStatus.draft,
      });

      expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
    });
  });
});
