-- Every catalog price 25 % lower (November 2026): from US$20 up rounded to the nearest 5,
-- below to the nearest 1. Fresh databases get the same prices from prisma/seed.ts.
UPDATE "CatalogItem" SET
  "price" = CASE WHEN "price" IS NULL THEN NULL WHEN "price" * 0.75 >= 2000 THEN (FLOOR("price" * 0.75 / 500.0 + 0.5) * 500)::INTEGER ELSE (FLOOR("price" * 0.75 / 100.0 + 0.5) * 100)::INTEGER END,
  "minPrice" = CASE WHEN "minPrice" IS NULL THEN NULL WHEN "minPrice" * 0.75 >= 2000 THEN (FLOOR("minPrice" * 0.75 / 500.0 + 0.5) * 500)::INTEGER ELSE (FLOOR("minPrice" * 0.75 / 100.0 + 0.5) * 100)::INTEGER END,
  "maxPrice" = CASE WHEN "maxPrice" IS NULL THEN NULL WHEN "maxPrice" * 0.75 >= 2000 THEN (FLOOR("maxPrice" * 0.75 / 500.0 + 0.5) * 500)::INTEGER ELSE (FLOOR("maxPrice" * 0.75 / 100.0 + 0.5) * 100)::INTEGER END,
  "maintenancePrice" = CASE WHEN "maintenancePrice" IS NULL THEN NULL WHEN "maintenancePrice" * 0.75 >= 2000 THEN (FLOOR("maintenancePrice" * 0.75 / 500.0 + 0.5) * 500)::INTEGER ELSE (FLOOR("maintenancePrice" * 0.75 / 100.0 + 0.5) * 100)::INTEGER END,
  "updatedAt" = NOW();
