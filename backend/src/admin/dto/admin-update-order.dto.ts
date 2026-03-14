import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { OrderStatus } from "@prisma/client";

export class AdminUpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remains?: number;

  @IsOptional()
  @IsString()
  providerOrderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
