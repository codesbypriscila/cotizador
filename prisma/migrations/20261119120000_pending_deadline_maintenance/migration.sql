-- Proposals from the public page arrive as "Pendiente".
ALTER TYPE "QuoteStatus" ADD VALUE 'PENDING' BEFORE 'SENT';

-- Delivery date agreed with the client.
ALTER TABLE "Quote" ADD COLUMN "deadline" TIMESTAMP(3);

-- Monthly maintenance price for each project type (a mobile app costs more to maintain than a landing page).
ALTER TABLE "CatalogItem" ADD COLUMN "maintenancePrice" INTEGER;
