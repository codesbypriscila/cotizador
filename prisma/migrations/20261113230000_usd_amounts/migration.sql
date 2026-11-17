-- Amounts move from Dominican pesos to US dollar cents.
-- Existing rows are sample data: run `npm run db:seed` after this migration.

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'DOP');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "usdRate",
ADD COLUMN "dopRate" DOUBLE PRECISION NOT NULL DEFAULT 60,
ADD COLUMN "rateCheckedAt" TIMESTAMP(3),
ADD COLUMN "rateSource" TEXT NOT NULL DEFAULT '',
ADD COLUMN "rateUpdatedAt" TIMESTAMP(3);
