import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TicketStatus, UserRole } from "@prisma/client";
import { GrowthBotService } from "src/growth-bot/growth-bot.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TicketsService } from "./tickets.service";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";

const customer: AuthenticatedUser = {
  id: "user-1",
  email: "c@x.com",
  role: UserRole.customer,
  fullName: null,
  isActive: true,
};

const otherCustomer: AuthenticatedUser = { ...customer, id: "user-2" };

const staff: AuthenticatedUser = {
  id: "support-1",
  email: "s@x.com",
  role: UserRole.support,
  fullName: null,
  isActive: true,
};

const ownedTicket = {
  id: "ticket-1",
  userId: "user-1",
  status: TicketStatus.open,
};

function createMockPrisma() {
  return {
    ticket: {
      create: jest.fn().mockResolvedValue({ id: "ticket-1" }),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ id: "ticket-1" }),
    },
    ticketMessage: {
      create: jest.fn().mockResolvedValue({ id: "msg-1" }),
    },
    order: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((arg: unknown) =>
      Array.isArray(arg) ? Promise.all(arg) : (arg as () => unknown)()
    ),
  };
}

describe("TicketsService", () => {
  let service: TicketsService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let growthBot: { onCustomerMessage: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrisma();
    growthBot = { onCustomerMessage: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GrowthBotService, useValue: growthBot },
      ],
    }).compile();
    service = module.get(TicketsService);
  });

  describe("createTicket", () => {
    it("creates ticket with first message", async () => {
      const result = await service.createTicket(customer, {
        subject: "Help",
        message: "It broke",
      });
      expect(result.success).toBe(true);
      expect(prisma.ticket.create).toHaveBeenCalled();
    });

    it("rejects orderId not owned by user", async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(
        service.createTicket(customer, {
          subject: "Help",
          message: "x",
          orderId: "order-9",
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("listTickets", () => {
    it("scopes to own tickets for customer", async () => {
      await service.listTickets(customer, {});
      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: "user-1" }) })
      );
    });

    it("shows all tickets for staff", async () => {
      await service.listTickets(staff, {});
      const arg = prisma.ticket.findMany.mock.calls[0][0];
      expect(arg.where.userId).toBeUndefined();
    });
  });

  describe("getTicketById", () => {
    it("hides other users' tickets (NotFound)", async () => {
      prisma.ticket.findUnique.mockResolvedValue({ ...ownedTicket });
      await expect(
        service.getTicketById(otherCustomer, "ticket-1")
      ).rejects.toThrow(NotFoundException);
    });

    it("lets staff read any ticket", async () => {
      prisma.ticket.findUnique.mockResolvedValue({ ...ownedTicket });
      const result = await service.getTicketById(staff, "ticket-1");
      expect(result.success).toBe(true);
    });
  });

  describe("addMessage", () => {
    it("customer reply reopens ticket to open", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ ...ownedTicket, status: TicketStatus.answered })
        .mockResolvedValueOnce({ ...ownedTicket, status: TicketStatus.open });
      await service.addMessage(customer, "ticket-1", { body: "still broken" });
      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TicketStatus.open } })
      );
    });

    it("staff reply sets status answered", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ ...ownedTicket, status: TicketStatus.open })
        .mockResolvedValueOnce({ ...ownedTicket, status: TicketStatus.answered });
      await service.addMessage(staff, "ticket-1", { body: "on it" });
      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TicketStatus.answered } })
      );
    });

    it("lets the assistant answer a customer message in a goal thread", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: "req-1" })
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: "req-1" });

      await service.addMessage(customer, "ticket-1", { body: "CONFIRM" });

      expect(growthBot.onCustomerMessage).toHaveBeenCalledWith(
        "ticket-1",
        "CONFIRM"
      );
    });

    it("keeps the assistant out of staff replies", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: "req-1" })
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: "req-1" });

      await service.addMessage(staff, "ticket-1", { body: "taking over" });

      expect(growthBot.onCustomerMessage).not.toHaveBeenCalled();
    });

    it("keeps the assistant out of ordinary support tickets", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: null })
        .mockResolvedValueOnce({ ...ownedTicket, growthRequestId: null });

      await service.addMessage(customer, "ticket-1", { body: "CONFIRM" });

      expect(growthBot.onCustomerMessage).not.toHaveBeenCalled();
    });

    it("rejects messages on a closed ticket", async () => {
      prisma.ticket.findUnique.mockResolvedValue({
        ...ownedTicket,
        status: TicketStatus.closed,
      });
      await expect(
        service.addMessage(customer, "ticket-1", { body: "hi" })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateStatus", () => {
    it("forbids customers from changing status", async () => {
      await expect(
        service.updateStatus(customer, "ticket-1", { status: TicketStatus.resolved })
      ).rejects.toThrow(ForbiddenException);
    });

    it("lets staff resolve a ticket", async () => {
      prisma.ticket.findUnique
        .mockResolvedValueOnce({ id: "ticket-1" })
        .mockResolvedValueOnce({ ...ownedTicket, status: TicketStatus.resolved });
      const result = await service.updateStatus(staff, "ticket-1", {
        status: TicketStatus.resolved,
      });
      expect(result.success).toBe(true);
      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TicketStatus.resolved } })
      );
    });
  });
});
