import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { RateLimitGuard } from "src/common/guards/rate-limit.guard";
import { RateLimit } from "src/common/rate-limit/rate-limit.decorator";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { PaymentsHistoryQueryDto } from "./dto/payments-history-query.dto";
import { PaymentsService } from "./payments.service";

type StripeRequest = Request & { rawBody?: Buffer };

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAccessGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 12, keyPrefix: "payments:checkout" })
  @Post("checkout")
  createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.paymentsService.createCheckoutSession(user.id, dto);
  }

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 60 * 1000, maxRequests: 120, keyPrefix: "payments:webhook" })
  @Post("webhook")
  handleWebhook(
    @Headers("stripe-signature") signature: string | undefined,
    @Req() request: StripeRequest
  ) {
    return this.paymentsService.processWebhook(signature, request.rawBody);
  }

  @UseGuards(JwtAccessGuard)
  @Get("history")
  getPaymentHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaymentsHistoryQueryDto
  ) {
    return this.paymentsService.getPaymentHistory(user.id, query);
  }
}
