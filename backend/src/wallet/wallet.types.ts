import { WalletTransactionType } from "@prisma/client";

export type WalletOperationInput = {
  userId: string;
  amount: number;
  currency?: string;
  type: WalletTransactionType;
  description?: string;
  providerRef?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};
