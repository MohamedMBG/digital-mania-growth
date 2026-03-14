import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TicketStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ListTicketsQueryDto } from "./dto/list-tickets-query.dto";

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(user: AuthenticatedUser, dto: CreateTicketDto) {
    const ticket = await this.prisma.$transaction(async (tx) => {
      const createdTicket = await tx.ticket.create({
        data: {
          userId: user.id,
          subject: dto.subject,
          status: TicketStatus.open,
        },
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: createdTicket.id,
          authorId: user.id,
          message: dto.message,
        },
      });

      return createdTicket;
    });

    return this.getTicket(user, ticket.id, "Ticket created successfully.");
  }

  async listTickets(user: AuthenticatedUser, query: ListTicketsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const status = this.parseStatus(query.status);

    const where: Prisma.TicketWhereInput = {
      ...(this.canViewAllTickets(user) ? {} : { userId: user.id }),
      ...(status ? { status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      success: true,
      message: "Tickets loaded successfully.",
      data: items.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        closedAt: ticket.closedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        user: ticket.user,
        messageCount: ticket._count.messages,
      })),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getTicket(
    user: AuthenticatedUser,
    ticketId: string,
    message = "Ticket loaded successfully."
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    this.assertCanAccessTicket(user, ticket.userId);

    return {
      success: true,
      message,
      data: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        closedAt: ticket.closedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        user: ticket.user,
        messages: ticket.messages.map((ticketMessage) => ({
          id: ticketMessage.id,
          message: ticketMessage.message,
          createdAt: ticketMessage.createdAt,
          author: ticketMessage.author,
        })),
      },
    };
  }

  async addMessage(
    user: AuthenticatedUser,
    ticketId: string,
    dto: CreateTicketMessageDto
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    this.assertCanAccessTicket(user, ticket.userId);

    if (ticket.status === TicketStatus.closed) {
      throw new BadRequestException("Cannot reply to a closed ticket.");
    }

    await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId: user.id,
        message: dto.message,
      },
    });

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return this.getTicket(user, ticketId, "Ticket reply added successfully.");
  }

  async closeTicket(user: AuthenticatedUser, ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    this.assertCanAccessTicket(user, ticket.userId);

    if (ticket.status === TicketStatus.closed) {
      throw new BadRequestException("Ticket is already closed.");
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.closed,
        closedAt: new Date(),
      },
    });

    return this.getTicket(user, ticketId, "Ticket closed successfully.");
  }

  private canViewAllTickets(user: AuthenticatedUser) {
    const elevatedRoles: UserRole[] = [UserRole.admin, UserRole.support];
    return elevatedRoles.includes(user.role);
  }

  private assertCanAccessTicket(user: AuthenticatedUser, ownerId: string) {
    if (this.canViewAllTickets(user)) {
      return;
    }

    if (user.id !== ownerId) {
      throw new ForbiddenException("You do not have access to this ticket.");
    }
  }

  private parseStatus(status?: string): TicketStatus | undefined {
    if (!status) {
      return undefined;
    }

    if ((Object.values(TicketStatus) as string[]).includes(status)) {
      return status as TicketStatus;
    }

    throw new BadRequestException("Invalid ticket status.");
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}
