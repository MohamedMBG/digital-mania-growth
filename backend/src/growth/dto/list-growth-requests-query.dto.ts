import { GrowthRequestStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class ListGrowthRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GrowthRequestStatus)
  status?: GrowthRequestStatus;
}
