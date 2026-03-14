import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { CreateTicketMessageDto } from "./dto/create-ticket-message.dto";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ListTicketsQueryDto } from "./dto/list-tickets-query.dto";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
@UseGuards(JwtAccessGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  createTicket(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(user, dto);
  }

  @Get()
  listTickets(@CurrentUser() user: AuthenticatedUser, @Query() query: ListTicketsQueryDto) {
    return this.ticketsService.listTickets(user, query);
  }

  @Get(":id")
  getTicket(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ticketsService.getTicket(user, id);
  }

  @Post(":id/messages")
  addMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateTicketMessageDto
  ) {
    return this.ticketsService.addMessage(user, id, dto);
  }

  @Patch(":id/close")
  closeTicket(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ticketsService.closeTicket(user, id);
  }
}
