-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin', 'support');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('deposit', 'charge', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'queued', 'processing', 'completed', 'partial', 'canceled', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "passwordHash" TEXT,
    "refreshTokenHash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "providerServiceId" TEXT,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "pricePerK" DECIMAL(12,2) NOT NULL,
    "minOrder" INTEGER NOT NULL,
    "maxOrder" INTEGER NOT NULL,
    "deliverySpeed" TEXT,
    "guarantee" TEXT,
    "refillPolicy" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "providerRef" TEXT,
    "reference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceBefore" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "WalletTransactionType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "checkoutSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "providerRef" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "chargeAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "targetUrl" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "providerServiceId" TEXT,
    "providerOrderId" TEXT,
    "startCount" INTEGER,
    "remains" INTEGER,
    "notes" TEXT,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueJobLog" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_slug_key" ON "Platform"("slug");

-- CreateIndex
CREATE INDEX "Platform_isActive_sortOrder_idx" ON "Platform"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Category_platformId_isActive_sortOrder_idx" ON "Category"("platformId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_platformId_slug_key" ON "Category"("platformId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_platformId_categoryId_isActive_sortOrder_idx" ON "Service"("platformId", "categoryId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Service_isFeatured_isActive_sortOrder_idx" ON "Service"("isFeatured", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_createdAt_idx" ON "WalletTransaction"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutSessionId_key" ON "Payment"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_walletId_createdAt_idx" ON "Payment"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_providerOrderId_key" ON "Order"("providerOrderId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_serviceId_createdAt_idx" ON "Order"("serviceId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusLog_orderId_createdAt_idx" ON "OrderStatusLog"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_actorId_createdAt_idx" ON "AdminActionLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_entityType_createdAt_idx" ON "AdminActionLog"("entityType", "createdAt");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusLog" ADD CONSTRAINT "OrderStatusLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

