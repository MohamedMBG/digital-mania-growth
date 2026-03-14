import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class ListServicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  platformSlug?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;
}
