import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  GrowthPlanStatus,
  GrowthRequestStatus,
  Prisma,
  TicketStatus,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { GrowthBotService } from "src/growth-bot/growth-bot.service";
import { buildPaginationMeta } from "src/common/utils/pagination";
import { PrismaService } from "src/prisma/prisma.service";
import { AdminCreateProgressSnapshotDto } from "./dto/admin-create-progress-snapshot.dto";
import { AdminListGrowthRequestsQueryDto } from "./dto/admin-list-growth-requests-query.dto";
import { AdminUpdateGrowthRequestDto } from "./dto/admin-update-growth-request.dto";
import { AdminUpsertGrowthPlanDto } from "./dto/admin-upsert-growth-plan.dto";
import { CreateGrowthRequestDto } from "./dto/create-growth-request.dto";
import { ListGrowthRequestsQueryDto } from "./dto/list-growth-requests-query.dto";
import { RespondToPlanDto } from "./dto/respond-to-plan.dto";

const requestInclude = {
  plan: true,
  progressSnapshots: { orderBy: { recordedAt: "asc" as const } },
  ticket: { select: { id: true, status: true } },
} satisfies Prisma.GrowthRequestInclude;

/** Wording used on the audience number for each platform. */
const AUDIENCE_LABELS: Record<string, string> = {
  instagram: "followers",
  tiktok: "followers",
  x: "followers",
  youtube: "subscribers",
  facebook: "audience",
  linkedin: "audience",
};

type GrowthRequestWithRelations = Prisma.GrowthRequestGetPayload<{
  include: typeof requestInclude;
}>;

/**
 * A plan is only visible to the customer once the team shares it. Drafts stay
 * internal so nobody sees half-written strategy.
 */
const CUSTOMER_VISIBLE_PLAN_STATUSES: GrowthPlanStatus[] = [
  GrowthPlanStatus.shared,
  GrowthPlanStatus.accepted,
  GrowthPlanStatus.changes_requested,
];

@Injectable()
export class GrowthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly growthBot: GrowthBotService
  ) {}

  private isStaff(user: AuthenticatedUser): boolean {
    return user.role === UserRole.admin || user.role === UserRole.support;
  }

  private serializePlan(plan: GrowthRequestWithRelations["plan"]) {
    if (!plan) return null;

    return {
      ...plan,
      price: plan.price ? plan.price.toNumber() : null,
    };
  }

  /**
   * Progress is derived only from snapshots a team member recorded. With no
   * snapshot there is no "current audience" — the UI shows the goal alone
   * rather than inventing a number.
   */
  private serializeRequest(
    request: GrowthRequestWithRelations,
    { includeInternal = false, includePlanDrafts = false } = {}
  ) {
    const snapshots = request.progressSnapshots;
    const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
    const plan = request.plan;
    const planVisible =
      includePlanDrafts ||
      (plan !== null && CUSTOMER_VISIBLE_PLAN_STATUSES.includes(plan.status));

    return {
      id: request.id,
      userId: request.userId,
      accountType: request.accountType,
      platform: request.platform,
      profile: request.profile,
      currentAudience: request.currentAudience,
      targetAudience: request.targetAudience,
      timeframe: request.timeframe,
      niche: request.niche,
      companyName: request.companyName,
      website: request.website,
      industry: request.industry,
      targetMarket: request.targetMarket,
      country: request.country,
      contactName: request.contactName,
      email: request.email,
      phone: request.phone,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      latestAudience: latest ? latest.audience : null,
      latestRecordedAt: latest ? latest.recordedAt : null,
      progressSnapshots: snapshots.map((snapshot) => ({
        id: snapshot.id,
        audience: snapshot.audience,
        note: snapshot.note,
        recordedAt: snapshot.recordedAt,
      })),
      plan: planVisible ? this.serializePlan(plan) : null,
      hasPlan: plan !== null,
      ticketId: request.ticket ? request.ticket.id : null,
      ticketStatus: request.ticket ? request.ticket.status : null,
      ...(includeInternal ? { internalNotes: request.internalNotes } : {}),
    };
  }

  /**
   * The brief the team reads first. It repeats the numbers the customer chose
   * so the whole engagement starts from one written, agreed statement.
   */
  private buildBriefMessage(dto: CreateGrowthRequestDto) {
    const audienceLabel = AUDIENCE_LABELS[dto.platform] ?? "audience";
    const lines = [
      `Platform: ${dto.platform}`,
      `Account: ${dto.profile.trim()}`,
      `Current ${audienceLabel}: ${dto.currentAudience.toLocaleString("en-US")}`,
      `Target ${audienceLabel}: ${dto.targetAudience.toLocaleString("en-US")}`,
      `Desired timeframe: ${dto.timeframe ?? "not_sure"}`,
    ];

    if (dto.niche) lines.push(`Niche: ${dto.niche}`);
    if (dto.companyName) lines.push(`Company: ${dto.companyName}`);
    if (dto.industry) lines.push(`Industry: ${dto.industry}`);
    if (dto.targetMarket) lines.push(`Target market: ${dto.targetMarket}`);
    if (dto.country) lines.push(`Country: ${dto.country}`);

    return `${lines.join("\n")}\n\nPlease review the account and reply with the plan, the timeline and the price.`;
  }

  /**
   * Anonymous visitors can submit a goal as a plain lead. A signed-in customer
   * additionally gets a private thread opened on the goal, seeded with their
   * brief, so every later exchange lives in one place with a real team member.
   */
  async createRequest(
    dto: CreateGrowthRequestDto,
    user?: AuthenticatedUser | null
  ) {
    const audienceLabel = AUDIENCE_LABELS[dto.platform] ?? "audience";
    const request = await this.prisma.$transaction(async (tx) => {
      const created = await tx.growthRequest.create({
        data: {
          userId: user?.id ?? null,
          accountType: dto.accountType,
          platform: dto.platform,
          profile: dto.profile.trim(),
          currentAudience: dto.currentAudience,
          targetAudience: dto.targetAudience,
          timeframe: dto.timeframe,
          niche: dto.niche,
          companyName: dto.companyName,
          website: dto.website,
          industry: dto.industry,
          targetMarket: dto.targetMarket,
          country: dto.country,
          contactName: dto.contactName.trim(),
          email: dto.email.trim().toLowerCase(),
          phone: dto.phone,
          status: GrowthRequestStatus.submitted,
        },
      });

      if (user) {
        await tx.ticket.create({
          data: {
            userId: user.id,
            growthRequestId: created.id,
            subject: `${dto.profile.trim()} — ${dto.targetAudience.toLocaleString(
              "en-US"
            )} ${audienceLabel}`,
            status: TicketStatus.open,
            messages: {
              create: {
                authorId: user.id,
                isStaff: false,
                body: this.buildBriefMessage(dto),
              },
            },
          },
        });
      }

      return tx.growthRequest.findUniqueOrThrow({
        where: { id: created.id },
        include: requestInclude,
      });
    });

    // The assistant opens the conversation with a priced offer. It reports its
    // own failures, so a quoting problem never fails the submission itself.
    if (request.ticket) {
      await this.growthBot.onGoalSubmitted(request.id);
    }

    return {
      success: true,
      message: "Growth request submitted successfully.",
      data: this.serializeRequest(request),
    };
  }

  async listMyRequests(
    user: AuthenticatedUser,
    query: ListGrowthRequestsQueryDto
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.GrowthRequestWhereInput = {
      userId: user.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.growthRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: requestInclude,
      }),
      this.prisma.growthRequest.count({ where }),
    ]);

    return {
      success: true,
      message: "Growth requests loaded successfully.",
      data: items.map((item) => this.serializeRequest(item)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getRequestById(
    user: AuthenticatedUser,
    requestId: string,
    message = "Growth request loaded successfully."
  ) {
    const staff = this.isStaff(user);
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      include: requestInclude,
    });

    if (!request || (!staff && request.userId !== user.id)) {
      throw new NotFoundException("Growth request not found.");
    }

    return {
      success: true,
      message,
      data: this.serializeRequest(request, {
        includeInternal: staff,
        includePlanDrafts: staff,
      }),
    };
  }

  async respondToPlan(
    user: AuthenticatedUser,
    requestId: string,
    dto: RespondToPlanDto
  ) {
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      include: { plan: true, ticket: { select: { id: true, status: true } } },
    });

    if (!request || request.userId !== user.id) {
      throw new NotFoundException("Growth request not found.");
    }

    if (
      !request.plan ||
      !CUSTOMER_VISIBLE_PLAN_STATUSES.includes(request.plan.status)
    ) {
      throw new ForbiddenException("No plan has been shared with you yet.");
    }

    const accepted = dto.decision === "accept";
    const ticket = request.ticket;
    const planId = request.plan.id;

    await this.prisma.$transaction(async (tx) => {
      await tx.growthPlan.update({
        where: { id: planId },
        data: {
          status: accepted
            ? GrowthPlanStatus.accepted
            : GrowthPlanStatus.changes_requested,
          customerNote: dto.note ?? null,
          respondedAt: new Date(),
        },
      });

      if (ticket && ticket.status !== TicketStatus.closed) {
        const note = dto.note?.trim();
        await tx.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: user.id,
            isStaff: false,
            body: accepted
              ? `I accept the plan.${note ? `\n\n${note}` : ""}`
              : `I'd like some changes to the plan.${note ? `\n\n${note}` : ""}`,
          },
        });

        await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.open },
        });
      }
    });

    return this.getRequestById(user, request.id, "Response recorded successfully.");
  }

  async adminListRequests(query: AdminListGrowthRequestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GrowthRequestWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.platform ? { platform: query.platform } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { contactName: { contains: query.search, mode: "insensitive" } },
              { profile: { contains: query.search, mode: "insensitive" } },
              { companyName: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.growthRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: requestInclude,
      }),
      this.prisma.growthRequest.count({ where }),
    ]);

    return {
      success: true,
      message: "Growth requests loaded successfully.",
      data: items.map((item) =>
        this.serializeRequest(item, {
          includeInternal: true,
          includePlanDrafts: true,
        })
      ),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async adminUpdateRequest(
    actor: AuthenticatedUser,
    requestId: string,
    dto: AdminUpdateGrowthRequestDto
  ) {
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException("Growth request not found.");
    }

    await this.prisma.growthRequest.update({
      where: { id: request.id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.internalNotes !== undefined
          ? { internalNotes: dto.internalNotes }
          : {}),
      },
    });

    await this.logAction(actor, "growth_request.update", request.id, {
      ...dto,
    });

    return this.getRequestById(
      actor,
      request.id,
      "Growth request updated successfully."
    );
  }

  async adminUpsertPlan(
    actor: AuthenticatedUser,
    requestId: string,
    dto: AdminUpsertGrowthPlanDto
  ) {
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, ticket: { select: { id: true } } },
    });

    if (!request) {
      throw new NotFoundException("Growth request not found.");
    }

    const status = dto.status ?? GrowthPlanStatus.draft;
    const planData = {
      title: dto.title,
      summary: dto.summary,
      strategy: dto.strategy,
      components: dto.components ?? [],
      estimatedTimeline: dto.estimatedTimeline ?? null,
      price: dto.price === undefined ? null : new Prisma.Decimal(dto.price),
      currency: dto.currency ?? "USD",
      notes: dto.notes ?? null,
      status,
      sharedAt: status === GrowthPlanStatus.draft ? null : new Date(),
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.growthPlan.upsert({
        where: { requestId: request.id },
        create: { requestId: request.id, ...planData },
        update: planData,
      });

      // Sharing a plan moves the request forward, but never rolls a request
      // that is already active/completed back to an earlier stage.
      const advanceable: GrowthRequestStatus[] = [
        GrowthRequestStatus.submitted,
        GrowthRequestStatus.under_review,
      ];

      if (
        status !== GrowthPlanStatus.draft &&
        advanceable.includes(request.status)
      ) {
        await tx.growthRequest.update({
          where: { id: request.id },
          data: { status: GrowthRequestStatus.plan_ready },
        });
      }

      // Sharing a plan is an event the customer should see in the thread, not
      // only as a status change on the goal page.
      if (status !== GrowthPlanStatus.draft && request.ticket) {
        await tx.ticketMessage.create({
          data: {
            ticketId: request.ticket.id,
            authorId: actor.id,
            isStaff: true,
            body: `Your plan "${dto.title}" is ready. Open the Growth Plan tab on your goal to review the strategy, the timeline and the price, then accept it or ask for changes here.`,
          },
        });

        await tx.ticket.update({
          where: { id: request.ticket.id },
          data: { status: TicketStatus.answered },
        });
      }
    });

    await this.logAction(actor, "growth_plan.upsert", request.id, {
      status,
    });

    return this.getRequestById(actor, request.id, "Growth plan saved successfully.");
  }

  async adminAddProgressSnapshot(
    actor: AuthenticatedUser,
    requestId: string,
    dto: AdminCreateProgressSnapshotDto
  ) {
    const request = await this.prisma.growthRequest.findUnique({
      where: { id: requestId },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException("Growth request not found.");
    }

    await this.prisma.growthProgressSnapshot.create({
      data: {
        requestId: request.id,
        audience: dto.audience,
        note: dto.note ?? null,
        ...(dto.recordedAt ? { recordedAt: new Date(dto.recordedAt) } : {}),
      },
    });

    await this.logAction(actor, "growth_progress.create", request.id, {
      audience: dto.audience,
    });

    return this.getRequestById(
      actor,
      request.id,
      "Progress recorded successfully."
    );
  }

  private async logAction(
    actor: AuthenticatedUser,
    action: string,
    entityId: string,
    metadata: Prisma.InputJsonValue
  ) {
    await this.prisma.adminActionLog.create({
      data: {
        actorId: actor.id,
        action,
        entityType: "GrowthRequest",
        entityId,
        metadata,
      },
    });
  }
}
