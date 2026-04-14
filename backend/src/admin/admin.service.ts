import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  UserRole,
  WalletTransactionType,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ProviderService } from "src/provider/provider.service";
import { WalletService } from "src/wallet/wallet.service";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { OrdersService } from "src/orders/orders.service";
import { UsersService } from "src/users/users.service";
import { AdminCreateServiceDto } from "./dto/admin-create-service.dto";
import { AdminListQueryDto } from "./dto/admin-list-query.dto";
import { AdminUpdateOrderDto } from "./dto/admin-update-order.dto";
import { AdminUpdateServiceDto } from "./dto/admin-update-service.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { AdminWalletAdjustmentDto } from "./dto/admin-wallet-adjustment.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: ProviderService,
    private readonly walletService: WalletService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService
  ) {}

  async getUsers(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" } },
            { fullName: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          wallet: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      message: "Admin users loaded successfully.",
      data: items.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        provider: user.provider,
        isActive: user.isActive,
        walletBalance: user.wallet?.balance.toNumber() ?? 0,
        walletCurrency: user.wallet?.currency ?? "USD",
        orderCount: user._count.orders,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async updateUser(actor: AuthenticatedUser, userId: string, dto: AdminUpdateUserDto) {
    const updatedUser = await this.usersService.updateAdminManagedUser(userId, {
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
    });

    await this.logAdminAction(actor.id, "user.update", "user", updatedUser.id, {
      role: dto.role,
      isActive: dto.isActive,
      fullName: dto.fullName,
    });

    return {
      success: true,
      message: "User updated successfully.",
      data: this.serializeAdminUser(updatedUser),
    };
  }

  async getOrders(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = query.search
      ? {
          OR: [
            { id: { contains: query.search, mode: "insensitive" } },
            { providerOrderId: { contains: query.search, mode: "insensitive" } },
            { targetUrl: { contains: query.search, mode: "insensitive" } },
            { user: { email: { contains: query.search, mode: "insensitive" } } },
            { service: { name: { contains: query.search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          service: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: "Admin orders loaded successfully.",
      data: items.map((order) => this.serializeOrder(order)),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getPayments(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = query.search
      ? {
          OR: [
            { id: { contains: query.search, mode: "insensitive" } },
            { checkoutSessionId: { contains: query.search, mode: "insensitive" } },
            { paymentIntentId: { contains: query.search, mode: "insensitive" } },
            { wallet: { user: { email: { contains: query.search, mode: "insensitive" } } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          wallet: {
            include: {
              user: {
                select: { id: true, email: true, fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      success: true,
      message: "Admin payments loaded successfully.",
      data: items.map((payment) => ({
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        checkoutSessionId: payment.checkoutSessionId,
        paymentIntentId: payment.paymentIntentId,
        providerRef: payment.providerRef,
        description: payment.description,
        creditedAt: payment.creditedAt,
        user: payment.wallet.user,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async createService(actor: AuthenticatedUser, dto: AdminCreateServiceDto) {
    await this.ensurePlatformAndCategory(dto.platformId, dto.categoryId);

    const service = await this.prisma.service.create({
      data: {
        platformId: dto.platformId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        providerServiceId: dto.providerServiceId,
        description: dto.description,
        shortDescription: dto.shortDescription,
        pricePerK: new Prisma.Decimal(dto.pricePerK.toFixed(2)),
        minOrder: dto.minOrder,
        maxOrder: dto.maxOrder,
        deliverySpeed: dto.deliverySpeed,
        guarantee: dto.guarantee,
        refillPolicy: dto.refillPolicy,
        isFeatured: dto.isFeatured ?? false,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        platform: true,
        category: true,
      },
    });

    await this.logAdminAction(actor.id, "service.create", "service", service.id, {
      slug: service.slug,
      providerServiceId: service.providerServiceId,
    });

    return {
      success: true,
      message: "Service created successfully.",
      data: this.serializeService(service),
    };
  }

  async updateService(actor: AuthenticatedUser, serviceId: string, dto: AdminUpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existing) {
      throw new NotFoundException("Service not found.");
    }

    const platformId = dto.platformId ?? existing.platformId;
    const categoryId = dto.categoryId ?? existing.categoryId;
    await this.ensurePlatformAndCategory(platformId, categoryId);

    const updateData: Prisma.ServiceUpdateInput = {
      platform: { connect: { id: platformId } },
      category: { connect: { id: categoryId } },
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      ...(dto.providerServiceId !== undefined
        ? { providerServiceId: dto.providerServiceId }
        : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.shortDescription !== undefined
        ? { shortDescription: dto.shortDescription }
        : {}),
      ...(dto.pricePerK !== undefined
        ? { pricePerK: new Prisma.Decimal(dto.pricePerK.toFixed(2)) }
        : {}),
      ...(dto.minOrder !== undefined ? { minOrder: dto.minOrder } : {}),
      ...(dto.maxOrder !== undefined ? { maxOrder: dto.maxOrder } : {}),
      ...(dto.deliverySpeed !== undefined ? { deliverySpeed: dto.deliverySpeed } : {}),
      ...(dto.guarantee !== undefined ? { guarantee: dto.guarantee } : {}),
      ...(dto.refillPolicy !== undefined ? { refillPolicy: dto.refillPolicy } : {}),
      ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    };

    const service = await this.prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        platform: true,
        category: true,
      },
    });

    await this.logAdminAction(actor.id, "service.update", "service", service.id, {
      ...dto,
    });

    return {
      success: true,
      message: "Service updated successfully.",
      data: this.serializeService(service),
    };
  }

  async syncProviderServices(actor: AuthenticatedUser) {
    const providerServices = await this.providerService.getServices();
    const localServices = await this.prisma.service.findMany();
    const localByProviderId = new Map(
      localServices
        .filter((service) => service.providerServiceId)
        .map((service) => [service.providerServiceId as string, service])
    );
    const localByName = new Map(localServices.map((service) => [service.name.toLowerCase(), service]));

    let updated = 0;
    let matched = 0;
    const unmatched: Array<{ service: string; name: string; category?: string }> = [];

    for (const providerService of providerServices) {
      const localMatch =
        localByProviderId.get(String(providerService.service)) ??
        localByName.get(providerService.name.toLowerCase());

      if (!localMatch) {
        unmatched.push({
          service: String(providerService.service),
          name: providerService.name,
          category: providerService.category,
        });
        continue;
      }

      matched += 1;

      await this.prisma.service.update({
        where: { id: localMatch.id },
        data: {
          providerServiceId: String(providerService.service),
          pricePerK: new Prisma.Decimal(providerService.rate),
          minOrder: Number.parseInt(providerService.min, 10) || localMatch.minOrder,
          maxOrder: Number.parseInt(providerService.max, 10) || localMatch.maxOrder,
        },
      });

      updated += 1;
    }

    await this.logAdminAction(actor.id, "provider.sync-services", "provider", null, {
      matched,
      updated,
      unmatchedCount: unmatched.length,
    });

    return {
      success: true,
      message: "Provider services synchronized successfully.",
      data: {
        fetched: providerServices.length,
        matched,
        updated,
        unmatched,
      },
    };
  }

  async getProviderBalance(actor: AuthenticatedUser) {
    const balance = await this.providerService.getBalance();

    await this.logAdminAction(actor.id, "provider.view-balance", "provider", null, balance);

    return {
      success: true,
      message: "Provider balance loaded successfully.",
      data: balance,
    };
  }

  async updateOrder(actor: AuthenticatedUser, orderId: string, dto: AdminUpdateOrderDto) {
    if (dto.status === OrderStatus.canceled) {
      throw new BadRequestException(
        "Use the dedicated admin cancel endpoint so provider cancellation and wallet refunds stay synchronized."
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.startCount !== undefined ? { startCount: dto.startCount } : {}),
          ...(dto.remains !== undefined ? { remains: dto.remains } : {}),
          ...(dto.providerOrderId !== undefined
            ? { providerOrderId: dto.providerOrderId }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(dto.status === OrderStatus.canceled ? { canceledAt: new Date() } : {}),
        },
        include: {
          service: true,
          user: {
            select: { id: true, email: true, fullName: true },
          },
        },
      });

      if (dto.status !== undefined) {
        await tx.orderStatusLog.create({
          data: {
            orderId,
            status: dto.status,
            message: "Order updated by admin.",
            metadata: {
              actorId: actor.id,
              startCount: dto.startCount,
              remains: dto.remains,
              providerOrderId: dto.providerOrderId,
            },
          },
        });
      }

      return updatedOrder;
    });

    await this.logAdminAction(actor.id, "order.update", "order", orderId, {
      ...dto,
    });

    return {
      success: true,
      message: "Order updated successfully.",
      data: this.serializeOrder(updated),
    };
  }

  async cancelOrder(actor: AuthenticatedUser, orderId: string) {
    const result = await this.ordersService.cancelOrderAsAdmin(actor, orderId);

    await this.logAdminAction(actor.id, "order.cancel", "order", orderId, {
      actorId: actor.id,
    });

    return result;
  }

  async adjustWallet(actor: AuthenticatedUser, dto: AdminWalletAdjustmentDto) {
    if (![WalletTransactionType.deposit, WalletTransactionType.adjustment, WalletTransactionType.charge, WalletTransactionType.refund].includes(dto.type)) {
      throw new BadRequestException("Unsupported wallet adjustment type.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const direction =
      dto.type === WalletTransactionType.charge ? "debit" : "credit";

    const result =
      direction === "debit"
        ? await this.walletService.deductWallet({
            userId: dto.userId,
            amount: dto.amount,
            type: WalletTransactionType.adjustment,
            description:
              dto.description ?? `Admin debit adjustment applied by ${actor.email}`,
            metadata: {
              actorId: actor.id,
              requestedType: dto.type,
            },
          })
        : await this.walletService.creditWallet({
            userId: dto.userId,
            amount: dto.amount,
            type:
              dto.type === WalletTransactionType.deposit
                ? WalletTransactionType.deposit
                : WalletTransactionType.adjustment,
            description:
              dto.description ?? `Admin credit adjustment applied by ${actor.email}`,
            metadata: {
              actorId: actor.id,
              requestedType: dto.type,
            },
          });

    await this.logAdminAction(actor.id, "wallet.adjust", "wallet", result.wallet.id, {
      userId: dto.userId,
      amount: dto.amount,
      type: dto.type,
    });

    return {
      success: true,
      message: "Wallet adjusted successfully.",
      data: {
        walletId: result.wallet.id,
        userId: dto.userId,
        balance: result.wallet.balance.toNumber(),
        currency: result.wallet.currency,
        transactionId: result.transaction.id,
      },
    };
  }

  private async ensurePlatformAndCategory(platformId: string, categoryId: string) {
    const [platform, category] = await Promise.all([
      this.prisma.platform.findUnique({ where: { id: platformId } }),
      this.prisma.category.findUnique({ where: { id: categoryId } }),
    ]);

    if (!platform) {
      throw new NotFoundException("Platform not found.");
    }

    if (!category || category.platformId !== platformId) {
      throw new NotFoundException("Category not found for this platform.");
    }
  }

  private async logAdminAction(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string | null,
    metadata?: Record<string, unknown> | Prisma.JsonValue
  ) {
    await this.prisma.adminActionLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private serializeService(service: {
    id: string;
    name: string;
    slug: string;
    providerServiceId: string | null;
    description: string;
    shortDescription: string | null;
    pricePerK: { toNumber(): number };
    minOrder: number;
    maxOrder: number;
    deliverySpeed: string | null;
    guarantee: string | null;
    refillPolicy: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    platform: Record<string, unknown>;
    category: Record<string, unknown>;
  }) {
    return {
      ...service,
      pricePerK: service.pricePerK.toNumber(),
    };
  }

  private serializeOrder(order: {
    id: string;
    quantity: number;
    chargeAmount: { toNumber(): number };
    currency: string;
    targetUrl: string;
    status: OrderStatus;
    providerServiceId: string | null;
    providerOrderId: string | null;
    startCount: number | null;
    remains: number | null;
    notes: string | null;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user?: Record<string, unknown>;
    service?: Record<string, unknown>;
  }) {
    return {
      ...order,
      chargeAmount: order.chargeAmount.toNumber(),
    };
  }

  private serializeAdminUser(user: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    provider: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      provider: user.provider,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
