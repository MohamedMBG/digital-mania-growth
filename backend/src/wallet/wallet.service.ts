import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, WalletTransactionType } from "@prisma/client";
import { buildPaginationMeta } from "src/common/utils/pagination";
import { PrismaService } from "src/prisma/prisma.service";
import { WalletTransactionsQueryDto } from "./dto/wallet-transactions-query.dto";
import { WalletOperationInput } from "./wallet.types";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureWalletForUser(
    userId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma;

    return client.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getWalletRecordById(walletId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.wallet.findUnique({
      where: { id: walletId },
    });
  }

  async getWallet(userId: string) {
    const ensuredWallet = await this.ensureWalletForUser(userId);

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: ensuredWallet.id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found.");
    }

    return {
      success: true,
      message: "Wallet loaded successfully.",
      data: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance.toNumber(),
        currency: wallet.currency,
        transactionCount: wallet._count.transactions,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    };
  }

  async getTransactions(userId: string, query: WalletTransactionsQueryDto) {
    const wallet = await this.ensureWalletForUser(userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const normalizedType = this.parseTransactionType(query.type);

    const where: Prisma.WalletTransactionWhereInput = {
      walletId: wallet.id,
      ...(normalizedType ? { type: normalizedType } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      success: true,
      message: "Wallet transactions loaded successfully.",
      data: items.map((item) => ({
        id: item.id,
        walletId: item.walletId,
        providerRef: item.providerRef,
        reference: item.reference,
        amount: item.amount.toNumber(),
        balanceBefore: item.balanceBefore.toNumber(),
        balanceAfter: item.balanceAfter.toNumber(),
        currency: item.currency,
        type: item.type,
        description: item.description,
        metadata: item.metadata,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async creditWallet(input: WalletOperationInput, tx?: Prisma.TransactionClient) {
    this.assertPositiveAmount(input.amount);

    const amount = new Prisma.Decimal(input.amount.toFixed(2));

    return this.withTransaction(tx, async (client) => {
      const wallet = await this.ensureWalletForUser(input.userId, client);

      const rows = await client.$queryRaw<
        Array<{ balance_before: Prisma.Decimal; balance_after: Prisma.Decimal }>
      >`
        UPDATE "Wallet"
        SET "balance" = "balance" + ${amount}, "updatedAt" = NOW()
        WHERE "id" = ${wallet.id}
        RETURNING ("balance" - ${amount})::numeric AS balance_before,
                  "balance"::numeric AS balance_after
      `;

      if (rows.length === 0) {
        throw new NotFoundException("Wallet not found.");
      }

      const { balance_before: balanceBefore, balance_after: balanceAfter } = rows[0];

      const transaction = await client.walletTransaction.create({
        data: {
          walletId: wallet.id,
          providerRef: input.providerRef,
          reference: input.reference,
          amount,
          balanceBefore,
          balanceAfter,
          currency: input.currency ?? wallet.currency,
          type: input.type,
          description: input.description,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      return {
        wallet: { ...wallet, balance: balanceAfter, updatedAt: new Date() },
        transaction,
      };
    });
  }

  async deductWallet(input: WalletOperationInput, tx?: Prisma.TransactionClient) {
    this.assertPositiveAmount(input.amount);

    const amount = new Prisma.Decimal(input.amount.toFixed(2));

    return this.withTransaction(tx, async (client) => {
      const wallet = await this.ensureWalletForUser(input.userId, client);

      const rows = await client.$queryRaw<
        Array<{ balance_before: Prisma.Decimal; balance_after: Prisma.Decimal }>
      >`
        UPDATE "Wallet"
        SET "balance" = "balance" - ${amount}, "updatedAt" = NOW()
        WHERE "id" = ${wallet.id} AND "balance" >= ${amount}
        RETURNING ("balance" + ${amount})::numeric AS balance_before,
                  "balance"::numeric AS balance_after
      `;

      if (rows.length === 0) {
        throw new BadRequestException("Insufficient wallet balance.");
      }

      const { balance_before: balanceBefore, balance_after: balanceAfter } = rows[0];

      const transaction = await client.walletTransaction.create({
        data: {
          walletId: wallet.id,
          providerRef: input.providerRef,
          reference: input.reference,
          amount,
          balanceBefore,
          balanceAfter,
          currency: input.currency ?? wallet.currency,
          type: input.type,
          description: input.description,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      return {
        wallet: { ...wallet, balance: balanceAfter, updatedAt: new Date() },
        transaction,
      };
    });
  }

  private assertPositiveAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("Amount must be greater than zero.");
    }
  }

  private parseTransactionType(type?: string): WalletTransactionType | undefined {
    if (!type) {
      return undefined;
    }

    if ((Object.values(WalletTransactionType) as string[]).includes(type)) {
      return type as WalletTransactionType;
    }

    throw new BadRequestException("Invalid wallet transaction type.");
  }

  private withTransaction<T>(
    tx: Prisma.TransactionClient | undefined,
    operation: (client: Prisma.TransactionClient) => Promise<T>
  ) {
    if (tx) {
      return operation(tx);
    }

    return this.prisma.$transaction(operation, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15_000,
      maxWait: 5_000,
    });
  }
}
