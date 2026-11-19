-- New catalog and prices (November 2026). Only touches an existing catalog:
-- on a fresh database the seed creates the same list (prisma/seed.ts).

-- Renamed services keep their id (and history).
UPDATE "CatalogItem" SET "name" = 'Integración de pagos (Azul, CardNet, PayPal)' WHERE "kind" = 'EXTRA' AND "name" = 'Pagos en línea';
UPDATE "CatalogItem" SET "name" = 'Dominio y hosting del primer año' WHERE "kind" = 'EXTRA' AND "name" = 'Dominio + hosting (1er año)';
UPDATE "CatalogItem" SET "name" = 'Sistema a la medida', "visible" = true WHERE "kind" = 'PROJECT' AND "name" = 'Sistema a medida';

CREATE TEMP TABLE "_catalog" ("kind" TEXT, "name" TEXT, "description" TEXT, "icon" TEXT, "price" INTEGER, "minPrice" INTEGER, "maxPrice" INTEGER, "unit" TEXT, "required" BOOLEAN, "maintenancePrice" INTEGER, "sortOrder" INTEGER);
INSERT INTO "_catalog" VALUES
  ('PROJECT', 'Landing page', 'Una sola página para tu campaña o negocio', 'layout-template', 25000, 20000, 50000, 'ONCE', false, 2500, 0),
  ('PROJECT', 'Página web', 'Hasta 5 secciones, se ve bien en celular', 'monitor', 50000, 40000, 100000, 'ONCE', false, 3500, 1),
  ('PROJECT', 'Tienda online', 'Catálogo, carrito y pedidos', 'shopping-bag', 90000, 80000, 250000, 'ONCE', false, 6000, 2),
  ('PROJECT', 'Sistema de reservas/citas', 'Para salones, clínicas, barberías y consultorios', 'calendar-check', 60000, 50000, 150000, 'ONCE', false, 4500, 3),
  ('PROJECT', 'Menú digital con QR', 'Para restaurantes y cafeterías', 'utensils', 12000, 10000, 30000, 'ONCE', false, 1500, 4),
  ('PROJECT', 'Portafolio/CV web', 'Para profesionales y freelancers', 'palette', 18000, 15000, 40000, 'ONCE', false, 2000, 5),
  ('PROJECT', 'Rediseño de sitio existente', 'Tu web de siempre, moderna y rápida', 'rocket', 30000, 25000, 80000, 'ONCE', false, 3500, 6),
  ('PROJECT', 'Automatizaciones/chatbot de WhatsApp', 'Respuestas automáticas, pedidos y recordatorios', 'message-circle', 35000, 30000, 90000, 'ONCE', false, 4000, 7),
  ('PROJECT', 'Sistema de inventario', 'Productos, stock, entradas, salidas y alertas de stock bajo', 'blocks', 80000, 70000, 200000, 'ONCE', false, 6000, 8),
  ('PROJECT', 'Sistema a la medida', 'Inventario, facturación, punto de venta o CRM sencillo', 'code', 120000, 100000, 400000, 'ONCE', false, 8000, 9),
  ('PROJECT', 'App móvil', 'iOS y Android', 'smartphone', 150000, 120000, 500000, 'ONCE', false, 9000, 10),
  ('PROJECT', 'Panel admin', 'Gestión interna del negocio', 'layout-dashboard', 70000, 60000, 200000, 'ONCE', false, 5000, 11),
  ('EXTRA', 'Páginas adicionales', 'Cada página extra', 'files', 4000, 3000, 8500, 'EACH', false, NULL, 0),
  ('EXTRA', 'Panel de administración', 'Para editar tu contenido', 'layout-dashboard', 35000, 30000, 100000, 'ONCE', false, NULL, 1),
  ('EXTRA', 'Reservas y citas', 'Formulario + calendario', 'calendar-check', 20000, 20000, 60000, 'ONCE', false, NULL, 2),
  ('EXTRA', 'Integración de pagos (Azul, CardNet, PayPal)', 'Cobra con tarjeta en tu web', 'credit-card', 22000, 20000, 65000, 'ONCE', false, NULL, 3),
  ('EXTRA', 'Login de usuarios', 'Cuentas para tus clientes', 'lock-keyhole', 15000, 15000, 40000, 'ONCE', false, NULL, 4),
  ('EXTRA', 'Notificaciones por WhatsApp', 'Avisos automáticos', 'bell-ring', 12000, 10000, 35000, 'ONCE', false, NULL, 5),
  ('EXTRA', 'Dominio y hosting del primer año', '.com + certificado SSL', 'globe', 6500, 6000, 13500, 'ONCE', false, NULL, 6),
  ('EXTRA', 'Correos corporativos', 'tunombre@empresa.com', 'mail', 4000, 3000, 12000, 'ONCE', false, NULL, 7),
  ('EXTRA', 'SEO básico y Google Business Profile', 'Para que te encuentren en Google y Maps', 'search', 12000, 10000, 40000, 'ONCE', false, NULL, 8),
  ('EXTRA', 'Multiidioma (español/inglés)', 'Tu web en dos idiomas', 'globe', 15000, 12000, 45000, 'ONCE', false, NULL, 9),
  ('EXTRA', 'Blog autoadministrable', 'Publica tus artículos tú misma', 'files', 18000, 15000, 50000, 'ONCE', false, NULL, 10),
  ('EXTRA', 'Redacción de textos o fotos de producto', 'Contenido listo para tu web', 'camera', 10000, 8000, 35000, 'ONCE', false, NULL, 11),
  ('EXTRA', 'Logo o mini kit de marca', 'Logo, colores y tipografías', 'palette', 12000, 10000, 40000, 'ONCE', false, NULL, 12),
  ('EXTRA', 'Mantenimiento mensual', 'Actualizaciones, respaldos y cambios pequeños', 'wrench', 3500, 2500, 17000, 'MONTHLY', true, NULL, 13),
  ('EXTRA', 'Hosting administrado', 'Servidor, SSL y respaldos, cobrado mensual', 'rocket', 1500, 1000, 5000, 'MONTHLY', true, NULL, 14),
  ('EXTRA', 'Soporte prioritario', 'Respuesta el mismo día', 'bell-ring', 4000, 3000, 12000, 'MONTHLY', false, NULL, 15);

-- Same name: new description, prices, order and rules.
UPDATE "CatalogItem" c SET
  "description" = n."description",
  "price" = n."price",
  "minPrice" = n."minPrice",
  "maxPrice" = n."maxPrice",
  "unit" = n."unit"::"PriceUnit",
  "required" = n."required",
  "maintenancePrice" = n."maintenancePrice",
  "sortOrder" = n."sortOrder",
  "updatedAt" = NOW()
FROM "_catalog" n
WHERE c."kind" = n."kind"::"CatalogKind" AND c."name" = n."name";

-- New services.
INSERT INTO "CatalogItem" ("id", "kind", "name", "description", "icon", "price", "minPrice", "maxPrice", "unit", "visible", "required", "maintenancePrice", "sortOrder", "createdAt", "updatedAt")
SELECT 'c' || substr(md5(random()::text || clock_timestamp()::text || n."name"), 1, 24), n."kind"::"CatalogKind", n."name", n."description", n."icon", n."price", n."minPrice", n."maxPrice", n."unit"::"PriceUnit", true, n."required", n."maintenancePrice", n."sortOrder", NOW(), NOW()
FROM "_catalog" n
WHERE EXISTS (SELECT 1 FROM "CatalogItem")
  AND NOT EXISTS (SELECT 1 FROM "CatalogItem" c WHERE c."kind" = n."kind"::"CatalogKind" AND c."name" = n."name");

DROP TABLE "_catalog";
