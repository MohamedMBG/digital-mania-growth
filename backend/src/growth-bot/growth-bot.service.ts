import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GrowthPlatform,
  GrowthQuoteStatus,
  GrowthRequest,
  GrowthRequestStatus,
  Prisma,
  TicketStatus,
  UserRole,
} from "@prisma/client";
import { AppLogger } from "src/common/logger/app-logger.service";
import { OrdersService } from "src/orders/orders.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletService } from "src/wallet/wallet.service";
import {
  CANCEL_PATTERN,
  CONFIRM_PATTERN,
  GROWTH_PLATFORM_MAPPINGS,
  HUMAN_PATTERN,
  PRICE_PATTERN,
} from "./growth-bot.constants";

type QuoteWithService = Prisma.GrowthQuoteGetPayload<{
  include: { service: true };
}>;

const money = (value: number) => value.toFixed(2);
const count = (value: number) => value.toLocaleString("en-US");

/**
 * The assistant that runs a goal thread end to end: it prices the goal, answers
 * the customer, and once the wallet actually covers the quote it places the
 * provider order through the normal orders pipeline. Anything it cannot price
 * or understand is handed to a human instead of guessed at.
 */
@Injectable()
export class GrowthBotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  private get botName() {
    return this.configService.get<string>("growthBot.name") ?? "TrendK Assistant";
  }

  /**
   * The assistant posts as its own support account so its messages are
   * attributable and can never be confused with a teammate's.
   */
  async ensureBotUser() {
    const email =
      this.configService.get<string>("growthBot.email") ?? "assistant@trendk.com";

    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      return existing;
    }

    // No password hash: the account exists to author messages, not to sign in.
    return this.prisma.user.create({
      data: {
        email,
        fullName: this.botName,
        role: UserRole.support,
        provider: "system",
      },
    });
  }

  private async postMessage(
    ticketId: string,
    body: string,
    status: TicketStatus = TicketStatus.answered
  ) {
    const bot = await this.ensureBotUser();

    await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId,
          authorId: bot.id,
          isStaff: true,
          isBot: true,
          body,
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status },
      }),
    ]);
  }

  /** Turns a handle into the profile URL the provider expects. */
  private buildTargetUrl(request: GrowthRequest) {
    const profile = request.profile.trim();

    if (/^https?:\/\//i.test(profile)) {
      return profile;
    }

    const mapping = GROWTH_PLATFORM_MAPPINGS[request.platform];
    const handle = profile.replace(/^@+/, "");

    return mapping ? `${mapping.profileBaseUrl}${handle}` : profile;
  }

  private async findCatalogueService(platform: GrowthPlatform) {
    const mapping = GROWTH_PLATFORM_MAPPINGS[platform];

    if (!mapping) {
      return null;
    }

    return this.prisma.service.findFirst({
      where: {
        isActive: true,
        providerServiceId: { not: null },
        platform: { slug: mapping.platformSlug, isActive: true },
        category: { slug: mapping.categorySlug, isActive: true },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    });
  }

  /**
   * Prices the gap between where the account is and where the customer wants
   * it. The quantity is clamped to what the service can actually deliver, so a
   * quote is always something the order pipeline will accept.
   */
  private async buildQuote(request: GrowthRequest) {
    const service = await this.findCatalogueService(request.platform);

    if (!service) {
      return null;
    }

    const gap = request.targetAudience - request.currentAudience;

    if (gap <= 0) {
      return null;
    }

    const quantity = Math.min(Math.max(gap, service.minOrder), service.maxOrder);
    const markupPercent =
      this.configService.get<number>("growthBot.markupPercent") ?? 0;
    const unitPricePerK = service.pricePerK.toNumber() * (1 + markupPercent / 100);
    const total = Number(((quantity / 1000) * unitPricePerK).toFixed(2));

    const quote = await this.prisma.growthQuote.create({
      data: {
        requestId: request.id,
        serviceId: service.id,
        quantity,
        unitPricePerK: new Prisma.Decimal(unitPricePerK.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        targetUrl: this.buildTargetUrl(request),
        status: GrowthQuoteStatus.quoted,
      },
      include: { service: true },
    });

    return { quote, gap };
  }

  private quoteMessage(
    request: GrowthRequest,
    quote: QuoteWithService,
    gap: number,
    { greet = true } = {}
  ) {
    const mapping = GROWTH_PLATFORM_MAPPINGS[request.platform];
    const label = mapping?.audienceLabel ?? "audience";
    const lines = [
      greet
        ? `Hi ${request.contactName.split(" ")[0]}, I'm the ${this.botName} and I'll handle this goal with you from here.`
        : "Here's the updated quote:",
      "",
      `Account: ${request.profile}`,
      `Now: ${count(request.currentAudience)} ${label}`,
      `Target: ${count(request.targetAudience)} ${label}`,
      `Gap to cover: ${count(gap)} ${label}`,
      "",
      `Plan: ${quote.service.name} — ${count(quote.quantity)} ${label} delivered to ${quote.targetUrl}.`,
      `Typical start: ${quote.service.deliverySpeed ?? "within a few hours"}.`,
      quote.service.refillPolicy ? `Refill: ${quote.service.refillPolicy}.` : "",
      "",
      `Price: ${quote.currency} ${money(quote.total.toNumber())} (${quote.currency} ${money(
        quote.unitPricePerK.toNumber()
      )} per 1,000).`,
      "",
      "Reply CONFIRM and I'll take payment from your wallet balance and start the delivery right away. Ask me anything first — price, timing, a different number — or say HUMAN if you'd rather talk to someone on the team.",
    ];

    if (quote.quantity !== gap) {
      lines.splice(
        7,
        0,
        `Note: this service runs in batches of ${count(quote.service.minOrder)}–${count(
          quote.service.maxOrder
        )}, so I've quoted ${count(quote.quantity)} for this round.`
      );
    }

    return lines.filter((line) => line !== "").join("\n");
  }

  /**
   * Prices a goal and posts the offer. Used both when the goal arrives and
   * whenever a thread finds itself without a live quote, so a conversation
   * never dead-ends on a missing one.
   */
  private async quoteAndPost(
    request: GrowthRequest,
    ticketId: string,
    targetOverride?: number
  ) {
    const priced = targetOverride
      ? { ...request, targetAudience: targetOverride }
      : request;
    const built = await this.buildQuote(priced);

    if (!built) {
      await this.postMessage(
        ticketId,
        `I can't price this one automatically — I've passed it to the team and someone will reply here shortly.`,
        TicketStatus.open
      );
      return null;
    }

    await this.postMessage(
      ticketId,
      this.quoteMessage(priced, built.quote, built.gap, { greet: false })
    );

    return built.quote;
  }

  /** Called as soon as a goal thread exists. Opens with a priced offer. */
  async onGoalSubmitted(requestId: string) {
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      include: { ticket: { select: { id: true } } },
    });

    if (!request?.ticket) {
      return;
    }

    try {
      const built = await this.buildQuote(request);

      if (!built) {
        await this.postMessage(
          request.ticket.id,
          `Hi ${request.contactName.split(" ")[0]}, I'm the ${this.botName}. This goal needs a person to price it — I've passed your brief to the team and someone will reply here shortly.`,
          TicketStatus.open
        );
        return;
      }

      await this.postMessage(
        request.ticket.id,
        this.quoteMessage(request, built.quote, built.gap)
      );
    } catch (error) {
      this.logger.error(
        `Assistant could not open goal ${request.id}: ${(error as Error).message}`,
        undefined,
        "GrowthBotService"
      );
    }
  }

  /**
   * Pulls a target audience out of a free-text message: "50k", "50,000",
   * "50 000" and "make it 50000" all resolve. Returns null when the message
   * carries no number worth re-quoting on.
   */
  private extractTargetNumber(body: string) {
    const match = body.match(/(\d[\d\s.,]*)\s*(k|m)?\b/i);

    if (!match) {
      return null;
    }

    const digits = Number(match[1].replace(/[\s.,]/g, ""));

    if (!Number.isFinite(digits) || digits <= 0) {
      return null;
    }

    const suffix = match[2]?.toLowerCase();
    const value =
      suffix === "k" ? digits * 1000 : suffix === "m" ? digits * 1_000_000 : digits;

    // Small bare numbers are usually part of a sentence, not a target.
    return value >= 100 ? Math.round(value) : null;
  }

  private latestQuote(requestId: string) {
    return this.prisma.growthQuote.findFirst({
      where: { requestId },
      orderBy: { createdAt: "desc" },
      include: { service: true },
    });
  }

  /**
   * Reads a customer message in a goal thread and answers it. Only the intents
   * below are acted on; everything else is escalated rather than improvised.
   */
  async onCustomerMessage(ticketId: string, body: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, growthRequestId: true, userId: true },
    });

    if (!ticket?.growthRequestId) {
      return;
    }

    const request = await this.prisma.growthRequest.findUnique({
      where: { id: ticket.growthRequestId },
    });

    if (!request) {
      return;
    }

    try {
      if (HUMAN_PATTERN.test(body)) {
        await this.postMessage(
          ticket.id,
          "No problem — I've flagged this thread for the team. A person will pick it up here shortly.",
          TicketStatus.open
        );
        return;
      }

      const quote = await this.latestQuote(request.id);
      const live =
        quote &&
        (quote.status === GrowthQuoteStatus.quoted ||
          quote.status === GrowthQuoteStatus.awaiting_payment)
          ? quote
          : null;

      if (CANCEL_PATTERN.test(body)) {
        if (live) {
          await this.prisma.growthQuote.update({
            where: { id: live.id },
            data: { status: GrowthQuoteStatus.cancelled },
          });
        }

        await this.postMessage(
          ticket.id,
          "Cancelled — nothing has been charged. Tell me a different number whenever you want a new quote.",
          TicketStatus.open
        );
        return;
      }

      // Confirmation is checked before any number so "confirm the 37.67" is
      // read as agreement rather than as a new target.
      if (live && CONFIRM_PATTERN.test(body)) {
        await this.settleQuote(live, ticket.userId, ticket.id);
        return;
      }

      // Otherwise a number in the message wins: the customer is naming the
      // target they actually want, which is a new quote rather than an answer.
      const requestedTarget = this.extractTargetNumber(body);

      if (requestedTarget && requestedTarget > request.currentAudience) {
        if (live) {
          await this.prisma.growthQuote.update({
            where: { id: live.id },
            data: { status: GrowthQuoteStatus.cancelled },
          });
        }

        await this.prisma.growthRequest.update({
          where: { id: request.id },
          data: { targetAudience: requestedTarget },
        });

        await this.quoteAndPost(request, ticket.id, requestedTarget);
        return;
      }

      if (live && PRICE_PATTERN.test(body)) {
        await this.postMessage(
          ticket.id,
          `The quote on this goal is ${live.currency} ${money(
            live.total.toNumber()
          )} for ${count(live.quantity)} on ${live.targetUrl}. Reply CONFIRM and I'll charge your wallet and start it.`
        );
        return;
      }

      if (live) {
        await this.postMessage(
          ticket.id,
          `I've noted that and passed it to the team, who will reply here. If you just want to go ahead with the ${live.currency} ${money(
            live.total.toNumber()
          )} quote, reply CONFIRM.`,
          TicketStatus.open
        );
        return;
      }

      if (quote?.status === GrowthQuoteStatus.ordered) {
        await this.postMessage(
          ticket.id,
          `This goal is already in delivery — ${count(
            quote.quantity
          )} to ${quote.targetUrl}. Tell me a new number if you want to go further and I'll quote it.`,
          TicketStatus.answered
        );
        return;
      }

      // No live quote (a fresh thread, a cancelled one, or a goal from before
      // the assistant existed): price it now rather than stalling.
      await this.quoteAndPost(request, ticket.id);
    } catch (error) {
      this.logger.error(
        `Assistant failed on ticket ${ticketId}: ${(error as Error).message}`,
        undefined,
        "GrowthBotService"
      );
    }
  }

  /**
   * Charges the wallet and places the provider order, or parks the quote until
   * the money is there. The wallet is the single source of truth for "paid" —
   * the assistant never orders on an unfunded balance.
   */
  private async settleQuote(
    quote: QuoteWithService,
    userId: string,
    ticketId: string
  ) {
    const wallet = await this.walletService.ensureWalletForUser(userId);
    const balance = wallet.balance.toNumber();
    const total = quote.total.toNumber();

    if (balance < total) {
      const missing = total - balance;

      await this.prisma.growthQuote.update({
        where: { id: quote.id },
        data: {
          status: GrowthQuoteStatus.awaiting_payment,
          confirmedAt: new Date(),
        },
      });

      await this.postMessage(
        ticketId,
        [
          `Locked in: ${count(quote.quantity)} on ${quote.targetUrl} for ${quote.currency} ${money(
            total
          )}.`,
          "",
          `Your wallet holds ${quote.currency} ${money(balance)}, so ${quote.currency} ${money(
            missing
          )} is still needed. Add funds from the Billing page and I'll start the delivery automatically the moment the payment lands — you don't need to message me again.`,
        ].join("\n"),
        TicketStatus.answered
      );
      return;
    }

    await this.placeOrder(quote, userId, ticketId);
  }

  private async placeOrder(
    quote: QuoteWithService,
    userId: string,
    ticketId: string
  ) {
    try {
      const order = await this.ordersService.createOrder(userId, {
        serviceId: quote.serviceId,
        quantity: quote.quantity,
        targetUrl: quote.targetUrl,
        notes: `Growth goal ${quote.requestId} — placed by ${this.botName}.`,
      });

      const orderId = order.data.id as string;

      await this.prisma.$transaction([
        this.prisma.growthQuote.update({
          where: { id: quote.id },
          data: {
            status: GrowthQuoteStatus.ordered,
            orderId,
            orderedAt: new Date(),
            confirmedAt: quote.confirmedAt ?? new Date(),
          },
        }),
        this.prisma.growthRequest.update({
          where: { id: quote.requestId },
          data: { status: GrowthRequestStatus.active },
        }),
      ]);

      await this.postMessage(
        ticketId,
        [
          `Paid and sent to production. ${quote.currency} ${money(
            quote.total.toNumber()
          )} was taken from your wallet.`,
          "",
          `Order: ${orderId}`,
          `Delivering: ${count(quote.quantity)} to ${quote.targetUrl}`,
          `Expected start: ${quote.service.deliverySpeed ?? "within a few hours"}.`,
          "",
          "I'll post updates in this thread as the delivery progresses.",
        ].join("\n")
      );
    } catch (error) {
      const reason = (error as Error).message;

      await this.prisma.growthQuote.update({
        where: { id: quote.id },
        data: { status: GrowthQuoteStatus.failed, failureReason: reason },
      });

      this.logger.error(
        `Assistant could not place the order for quote ${quote.id}: ${reason}`,
        undefined,
        "GrowthBotService"
      );

      await this.postMessage(
        ticketId,
        "I couldn't place the order automatically, so nothing further has been charged. The team has been alerted and will sort this out with you here.",
        TicketStatus.open
      );
    }
  }

  /**
   * Called after a wallet top-up clears. Any quote the customer already
   * confirmed starts on its own, which is the whole point of confirming early.
   */
  async onWalletFunded(userId: string) {
    const pending = await this.prisma.growthQuote.findMany({
      where: {
        status: GrowthQuoteStatus.awaiting_payment,
        request: { userId },
      },
      orderBy: { confirmedAt: "asc" },
      include: { service: true },
    });

    for (const quote of pending) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { growthRequestId: quote.requestId },
        select: { id: true },
      });

      if (!ticket) {
        continue;
      }

      const wallet = await this.walletService.ensureWalletForUser(userId);

      if (wallet.balance.toNumber() < quote.total.toNumber()) {
        // Still short after this top-up; leave it parked for the next one.
        continue;
      }

      await this.placeOrder(quote, userId, ticket.id);
    }
  }
}
