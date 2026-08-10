import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export type GrowthPlanResponseDecision = "accept" | "request_changes";

export class RespondToPlanDto {
  @IsIn(["accept", "request_changes"])
  decision!: GrowthPlanResponseDecision;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
