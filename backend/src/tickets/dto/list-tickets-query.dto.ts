import { IsOptional, IsEnum } from "class-validator";
import { TicketStatus } from "@prisma/client";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class ListTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
