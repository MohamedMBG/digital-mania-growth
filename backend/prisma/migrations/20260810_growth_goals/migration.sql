-- CreateEnum
CREATE TYPE "GrowthPlatform" AS ENUM ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'linkedin');

-- CreateEnum
CREATE TYPE "GrowthTimeframe" AS ENUM ('one_month', 'three_months', 'six_months', 'twelve_months', 'not_sure');

-- CreateEnum
CREATE TYPE "GrowthAccountType" AS ENUM ('creator', 'business');

-- CreateEnum
CREATE TYPE "GrowthRequestStatus" AS ENUM ('submitted', 'under_review', 'plan_ready', 'active', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "GrowthPlanStatus" AS ENUM ('draft', 'shared', 'accepted', 'changes_requested');

-- CreateTable
CREATE TABLE "GrowthRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "accountType" "GrowthAccountType" NOT NULL DEFAULT 'creator',
    "platform" "GrowthPlatform" NOT NULL,
    "profile" TEXT NOT NULL,
    "currentAudience" INTEGER NOT NULL,
    "targetAudience" INTEGER NOT NULL,
    "timeframe" "GrowthTimeframe" NOT NULL DEFAULT 'not_sure',
    "niche" TEXT,
    "companyName" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "targetMarket" TEXT,
    "country" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "GrowthRequestStatus" NOT NULL DEFAULT 'submitted',
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthPlan" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "components" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedTimeline" TEXT,
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "status" "GrowthPlanStatus" NOT NULL DEFAULT 'draft',
    "sharedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "customerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthProgressSnapshot" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "audience" INTEGER NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthProgressSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrowthRequest_userId_createdAt_idx" ON "GrowthRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GrowthRequest_status_createdAt_idx" ON "GrowthRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GrowthRequest_email_createdAt_idx" ON "GrowthRequest"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthPlan_requestId_key" ON "GrowthPlan"("requestId");

-- CreateIndex
CREATE INDEX "GrowthPlan_status_updatedAt_idx" ON "GrowthPlan"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "GrowthProgressSnapshot_requestId_recordedAt_idx" ON "GrowthProgressSnapshot"("requestId", "recordedAt");

-- AddForeignKey
ALTER TABLE "GrowthRequest" ADD CONSTRAINT "GrowthRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthPlan" ADD CONSTRAINT "GrowthPlan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GrowthRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthProgressSnapshot" ADD CONSTRAINT "GrowthProgressSnapshot_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GrowthRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
