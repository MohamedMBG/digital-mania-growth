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

export class AdminCreateServiceDto {
  @IsString()
  platformId!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug!: string;

  @IsOptional()
  @IsString()
  providerServiceId?: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @Type(() => Number)
  @Min(0)
  pricePerK!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrder!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxOrder!: number;

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
