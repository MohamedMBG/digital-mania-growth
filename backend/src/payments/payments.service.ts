import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentStatus, Prisma, WalletTransactionType } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { PaymentsHistoryQueryDto } from "./dto/payments-history-query.dto";

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService
  ) {
    this.stripe = new Stripe(configService.getOrThrow<string>("stripe.secretKey"));
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    const wallet = await this.walletService.ensureWalletForUser(userId);
    const currency =
      dto.currency?.toLowerCase() ??
      this.configService.getOrThrow<string>("stripe.currency");
    const amountInMinorUnit = this.toMinorUnit(dto.amount);
    const successUrl = this.resolveCheckoutRedirectUrl(
      dto.successUrl,
      this.configService.getOrThrow<string>("stripe.checkoutSuccessUrl")
    );
    const cancelUrl = this.resolveCheckoutRedirectUrl(
      dto.cancelUrl,
      this.configService.getOrThrow<string>("stripe.checkoutCancelUrl")
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: undefined,
      metadata: {
        userId,
        walletId: wallet.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountInMinorUnit,
            product_data: {
              name: "Digital Mania Wallet Top-up",
              description: "Secure wallet top-up for future orders and payments.",
            },
          },
        },
      ],
    });

    await this.prisma.payment.create({
      data: {
        walletId: wallet.id,
        provider: "stripe",
        status: PaymentStatus.pending,
        amount: new Prisma.Decimal(dto.amount.toFixed(2)),
        currency,
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        providerRef: session.id,
        description: "Wallet top-up via Stripe Checkout",
        metadata: {
          mode: session.mode,
        },
      },
    });

    return {
      success: true,
      message: "Checkout session created successfully.",
      data: {
        checkoutSessionId: session.id,
        url: session.url,
        amount: dto.amount,
        currency,
        status: PaymentStatus.pending,
      },
    };
  }

  async getPaymentHistory(userId: string, query: PaymentsHistoryQueryDto) {
    const wallet = await this.walletService.ensureWalletForUser(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { walletId: wallet.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payment.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      success: true,
      message: "Payment history loaded successfully.",
      data: items.map((payment) => ({
        id: payment.id,
        walletId: payment.walletId,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        checkoutSessionId: payment.checkoutSessionId,
        paymentIntentId: payment.paymentIntentId,
        providerRef: payment.providerRef,
        description: payment.description,
        metadata: payment.metadata,
        creditedAt: payment.creditedAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async processWebhook(signature: string | undefined, rawBody: Buffer | undefined) {
    if (!signature || !rawBody) {
      throw new BadRequestException("Missing Stripe webhook signature or payload.");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.getOrThrow<string>("stripe.webhookSecret")
      );
    } catch {
      throw new UnauthorizedException("Invalid Stripe webhook signature.");
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await this.handleSuccessfulCheckout(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "checkout.session.expired":
        await this.updatePaymentStatus(
          event.data.object as Stripe.Checkout.Session,
          PaymentStatus.canceled
        );
        break;
      case "checkout.session.async_payment_failed":
        await this.updatePaymentStatus(
          event.data.object as Stripe.Checkout.Session,
          PaymentStatus.failed
        );
        break;
      default:
        break;
    }

    return {
      received: true,
    };
  }

  private async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutSessionId: session.id },
    });

    if (!payment) {
      throw new NotFoundException("Payment record not found for Stripe session.");
    }

    if (payment.creditedAt) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const updatedCount = await tx.payment.updateMany({
        where: {
          id: payment.id,
          creditedAt: null,
        },
        data: {
          status: PaymentStatus.succeeded,
          paymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          providerRef: session.id,
          metadata: {
            ...(this.asRecord(payment.metadata) ?? {}),
            stripePaymentStatus: session.payment_status,
          },
          creditedAt: new Date(),
        },
      });

      if (updatedCount.count === 0) {
        return;
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: payment.walletId },
      });

      if (!wallet) {
        throw new NotFoundException("Wallet not found for payment.");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          providerRef: session.id,
          reference: payment.id,
          amount: payment.amount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          currency: payment.currency,
          type: WalletTransactionType.deposit,
          description: "Wallet top-up credited from verified Stripe payment",
          metadata: {
            paymentId: payment.id,
            checkoutSessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
          status: "completed",
        },
      });
    });
  }

  private async updatePaymentStatus(
    session: Stripe.Checkout.Session,
    status: PaymentStatus
  ) {
    await this.prisma.payment.updateMany({
      where: { checkoutSessionId: session.id },
      data: {
        status,
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        providerRef: session.id,
      },
    });
  }

  private toMinorUnit(amount: number) {
    return Math.round(amount * 100);
  }

  private resolveCheckoutRedirectUrl(
    providedUrl: string | undefined,
    defaultUrl: string
  ) {
    if (!providedUrl) {
      return defaultUrl;
    }

    const allowedOrigins = this.configService
      .getOrThrow<string>("app.frontendUrl")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    const fallback = new URL(defaultUrl);
    const candidate = new URL(providedUrl);
    const exactAllowedMatch = allowedOrigins.includes(candidate.origin);
    const sameReturnPath = candidate.pathname === fallback.pathname;

    if (!exactAllowedMatch || !sameReturnPath) {
      throw new BadRequestException("Checkout redirect URL is not allowed.");
    }

    return candidate.toString();
  }

  private asRecord(value: Prisma.JsonValue | null | undefined) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, Prisma.JsonValue>;
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}
