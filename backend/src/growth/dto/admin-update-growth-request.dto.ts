import { GrowthRequestStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class AdminUpdateGrowthRequestDto {
  @IsOptional()
  @IsEnum(GrowthRequestStatus)
  status?: GrowthRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  internalNotes?: string;
}
