-- Extras the client cannot remove from the public quote (e.g. monthly maintenance).
ALTER TABLE "CatalogItem" ADD COLUMN "required" BOOLEAN NOT NULL DEFAULT false;

-- Monthly maintenance is always included.
UPDATE "CatalogItem" SET "required" = true WHERE "kind" = 'EXTRA' AND "name" = 'Mantenimiento mensual';
