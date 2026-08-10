import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class AdminCreateProgressSnapshotDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  audience!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
