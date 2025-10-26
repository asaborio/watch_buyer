-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('EBAY', 'CHRONO24');

-- CreateTable
CREATE TABLE "Watch" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "msrpCents" INTEGER NOT NULL,
    "description" TEXT,
    "brandDiscountBasisPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "source" "Marketplace" NOT NULL,
    "query" TEXT NOT NULL,
    "lowestCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "url" TEXT,
    "hasBox" BOOLEAN NOT NULL,
    "hasPapers" BOOLEAN NOT NULL,
    "location" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggestedBuyMinus2000Cents" INTEGER NOT NULL,
    "suggestedBuyMinus20PctCents" INTEGER NOT NULL,
    "brandTargetCents" INTEGER NOT NULL,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceSnapshot_watchId_idx" ON "PriceSnapshot"("watchId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_source_capturedAt_idx" ON "PriceSnapshot"("source", "capturedAt");

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
