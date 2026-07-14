import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}
