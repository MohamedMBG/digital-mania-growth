-- CreateEnum
CREATE TYPE "GrowthQuoteStatus" AS ENUM ('quoted', 'awaiting_payment', 'ordered', 'cancelled', 'failed');

-- AlterTable
ALTER TABLE "TicketMessage" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GrowthQuote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPricePerK" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "targetUrl" TEXT NOT NULL,
    "status" "GrowthQuoteStatus" NOT NULL DEFAULT 'quoted',
    "orderId" TEXT,
    "failureReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrowthQuote_orderId_key" ON "GrowthQuote"("orderId");

-- CreateIndex
CREATE INDEX "GrowthQuote_requestId_createdAt_idx" ON "GrowthQuote"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "GrowthQuote_status_updatedAt_idx" ON "GrowthQuote"("status", "updatedAt");

-- AddForeignKey
ALTER TABLE "GrowthQuote" ADD CONSTRAINT "GrowthQuote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GrowthRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthQuote" ADD CONSTRAINT "GrowthQuote_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthQuote" ADD CONSTRAINT "GrowthQuote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
