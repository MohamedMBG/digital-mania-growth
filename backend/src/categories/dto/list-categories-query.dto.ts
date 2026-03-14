import { IsOptional, IsString } from "class-validator";

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsString()
  platformSlug?: string;
}
