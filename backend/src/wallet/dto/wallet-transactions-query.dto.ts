import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class WalletTransactionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  type?: string;
}
