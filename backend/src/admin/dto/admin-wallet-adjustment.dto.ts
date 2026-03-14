import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { WalletTransactionType } from "@prisma/client";

export class AdminWalletAdjustmentDto {
  @IsString()
  userId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsEnum(WalletTransactionType)
  type!: WalletTransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
