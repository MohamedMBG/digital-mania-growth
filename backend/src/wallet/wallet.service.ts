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

      const updatedWallet = await client.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      const transaction = await client.walletTransaction.create({
        data: {
          walletId: wallet.id,
          providerRef: input.providerRef,
          reference: input.reference,
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          currency: input.currency ?? wallet.currency,
          type: input.type,
          description: input.description,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      return { wallet: updatedWallet, transaction };
    });
  }

  async deductWallet(input: WalletOperationInput, tx?: Prisma.TransactionClient) {
    this.assertPositiveAmount(input.amount);

    const amount = new Prisma.Decimal(input.amount.toFixed(2));

    return this.withTransaction(tx, async (client) => {
      const wallet = await this.ensureWalletForUser(input.userId, client);

      const updatedRows = await client.wallet.updateMany({
        where: {
          id: wallet.id,
          balance: {
            gte: amount,
          },
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      if (updatedRows.count === 0) {
        throw new BadRequestException("Insufficient wallet balance.");
      }

      const updatedWallet = await client.wallet.findUnique({
        where: { id: wallet.id },
      });

      if (!updatedWallet) {
        throw new NotFoundException("Wallet not found.");
      }

      const transaction = await client.walletTransaction.create({
        data: {
          walletId: wallet.id,
          providerRef: input.providerRef,
          reference: input.reference,
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          currency: input.currency ?? wallet.currency,
          type: input.type,
          description: input.description,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      return { wallet: updatedWallet, transaction };
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

    return this.prisma.$transaction(operation);
  }
}
