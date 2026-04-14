import { UserRole } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  fullName?: string;
}
