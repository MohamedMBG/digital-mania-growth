import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { OptionalJwtGuard } from "src/auth/guards/optional-jwt.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { RateLimit } from "src/common/rate-limit/rate-limit.decorator";
import { CreateGrowthRequestDto } from "./dto/create-growth-request.dto";
import { ListGrowthRequestsQueryDto } from "./dto/list-growth-requests-query.dto";
import { RespondToPlanDto } from "./dto/respond-to-plan.dto";
import { GrowthService } from "./growth.service";

@Controller("growth")
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  /**
   * Public lead capture. Anonymous visitors can submit; a signed-in visitor's
   * request is attached to their account so it shows up in their dashboard.
   */
  @Post("requests")
  @UseGuards(OptionalJwtGuard)
  @RateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: "growth-request" })
  createRequest(
    @Body() dto: CreateGrowthRequestDto,
    @CurrentUser() user?: AuthenticatedUser
  ) {
    return this.growthService.createRequest(dto, user);
  }

  @Get("requests")
  @UseGuards(JwtAccessGuard)
  listMyRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListGrowthRequestsQueryDto
  ) {
    return this.growthService.listMyRequests(user, query);
  }

  @Get("requests/:id")
  @UseGuards(JwtAccessGuard)
  getRequest(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.growthService.getRequestById(user, id);
  }

  @Post("requests/:id/plan-response")
  @UseGuards(JwtAccessGuard)
  respondToPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: RespondToPlanDto
  ) {
    return this.growthService.respondToPlan(user, id, dto);
  }
}
