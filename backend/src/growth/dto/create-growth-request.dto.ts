import {
  GrowthAccountType,
  GrowthPlatform,
  GrowthTimeframe,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateGrowthRequestDto {
  @IsOptional()
  @IsEnum(GrowthAccountType)
  accountType?: GrowthAccountType;

  @IsEnum(GrowthPlatform)
  platform!: GrowthPlatform;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  profile!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  currentAudience!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  targetAudience!: number;

  @IsOptional()
  @IsEnum(GrowthTimeframe)
  timeframe?: GrowthTimeframe;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  niche?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  targetMarket?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  contactName!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}
