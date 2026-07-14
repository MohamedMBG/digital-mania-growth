import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
  @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
  @Matches(/\d/, { message: "Password must contain at least one digit." })
  @Matches(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  fullName?: string;
}
