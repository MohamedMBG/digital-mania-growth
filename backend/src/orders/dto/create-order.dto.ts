import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Min, MaxLength } from "class-validator";

export class CreateOrderDto {
  @IsString()
  serviceId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsUrl({
    require_protocol: true,
  })
  targetUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
