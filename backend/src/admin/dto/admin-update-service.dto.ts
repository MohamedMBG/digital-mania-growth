import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class AdminUpdateServiceDto {
  @IsOptional()
  @IsString()
  platformId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug?: string;

  @IsOptional()
  @IsString()
  providerServiceId?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  pricePerK?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxOrder?: number;

  @IsOptional()
  @IsString()
  deliverySpeed?: string;

  @IsOptional()
  @IsString()
  guarantee?: string;

  @IsOptional()
  @IsString()
  refillPolicy?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
