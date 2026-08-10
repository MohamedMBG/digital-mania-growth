-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "growthRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_growthRequestId_key" ON "Ticket"("growthRequestId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_growthRequestId_fkey" FOREIGN KEY ("growthRequestId") REFERENCES "GrowthRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
