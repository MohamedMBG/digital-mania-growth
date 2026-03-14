import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUrl, Length, Max, Min } from "class-validator";

export class CreateCheckoutSessionDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(10000)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  successUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  cancelUrl?: string;
}
