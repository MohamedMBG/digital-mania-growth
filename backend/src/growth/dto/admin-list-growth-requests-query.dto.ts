import { GrowthPlatform, GrowthRequestStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class AdminListGrowthRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GrowthRequestStatus)
  status?: GrowthRequestStatus;

  @IsOptional()
  @IsEnum(GrowthPlatform)
  platform?: GrowthPlatform;

  @IsOptional()
  @IsString()
  search?: string;
}
