import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateTicketDto {
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  subject!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(4000)
  message!: string;
}
