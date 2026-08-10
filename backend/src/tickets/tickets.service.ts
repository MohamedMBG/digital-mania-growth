import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TicketStatus, UserRole } from "@prisma/client";
import { buildPaginationMeta } from "src/common/utils/pagination";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { GrowthBotService } from "src/growth-bot/growth-bot.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { ListTicketsQueryDto } from "./dto/list-tickets-query.dto";
import { UpdateTicketStatusDto } from "./dto/update-ticket-status.dto";

const ticketInclude = {
  order: { select: { id: true, status: true } },
  messages: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      body: true,
      isStaff: true,
      isBot: true,
      authorId: true,
      createdAt: true,
    },
  },
} satisfies Prisma.TicketInclude;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly growthBot: GrowthBotService
  ) {}

  private isStaff(user: AuthenticatedUser): boolean {
    return user.role === UserRole.admin || user.role === UserRole.support;
  }

  async createTicket(user: AuthenticatedUser, dto: CreateTicketDto) {
    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId: user.id },
        select: { id: true },
      });

      if (!order) {
        throw new NotFoundException("Linked order not found.");
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        userId: user.id,
        orderId: dto.orderId ?? null,
        subject: dto.subject,
        status: TicketStatus.open,
        messages: {
          create: {
            authorId: user.id,
            isStaff: false,
            body: dto.message,
          },
        },
      },
      include: ticketInclude,
    });

    return {
      success: true,
      message: "Ticket created successfully.",
      data: ticket,
    };
  }

  async listTickets(user: AuthenticatedUser, query: ListTicketsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      ...(this.isStaff(user) ? {} : { userId: user.id }),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          order: { select: { id: true, status: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      success: true,
      message: "Tickets loaded successfully.",
      data: items,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getTicketById(
    user: AuthenticatedUser,
    ticketId: string,
    message = "Ticket loaded successfully."
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: ticketInclude,
    });

    if (!ticket || (!this.isStaff(user) && ticket.userId !== user.id)) {
      throw new NotFoundException("Ticket not found.");
    }

    return { success: true, message, data: ticket };
  }

  async addMessage(
    user: AuthenticatedUser,
    ticketId: string,
    dto: CreateTicketMessageDto
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        userId: true,
        status: true,
        growthRequestId: true,
      },
    });

    if (!ticket || (!this.isStaff(user) && ticket.userId !== user.id)) {
      throw new NotFoundException("Ticket not found.");
    }

    if (ticket.status === TicketStatus.closed) {
      throw new ForbiddenException("This ticket is closed.");
    }

    const staff = this.isStaff(user);

    await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: user.id,
          isStaff: staff,
          body: dto.body,
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticket.id },
        // staff reply -> answered; customer reply -> back to open
        data: { status: staff ? TicketStatus.answered : TicketStatus.open },
      }),
    ]);

    // A customer writing in a goal thread is talking to the assistant, which
    // answers inline so the reply is already there when the thread reloads.
    if (!staff && ticket.growthRequestId) {
      await this.growthBot.onCustomerMessage(ticket.id, dto.body);
    }

    return this.getTicketById(user, ticket.id, "Message added successfully.");
  }

  async updateStatus(
    user: AuthenticatedUser,
    ticketId: string,
    dto: UpdateTicketStatusDto
  ) {
    if (!this.isStaff(user)) {
      throw new ForbiddenException("Only support staff can change ticket status.");
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: dto.status },
    });

    return this.getTicketById(user, ticket.id, "Ticket status updated successfully.");
  }
}
