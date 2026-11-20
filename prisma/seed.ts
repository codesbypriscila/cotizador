// Example data from the approved design. Prices are sample ranges from the
// freelance market in the Dominican Republic: all editable from the admin catalog.
// Numbers below are written in US dollars; the database stores cents (×100).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_TEMPLATE } from "../src/lib/whatsapp";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const usd = (dollars: number) => Math.round(dollars * 100);

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const inDays = (n: number) => new Date(Date.now() + n * DAY);

type Unit = "ONCE" | "EACH" | "MONTHLY";

// [name, description, icon, price, market min, market max, monthly maintenance] in US$.
// Prices for a freelancer starting out in the Dominican Republic.
const projects: [string, string, string, number, number, number, number][] = [
  ["Landing page", "Una sola página para tu campaña o negocio", "layout-template", 190, 150, 375, 19],
  ["Página web", "Hasta 5 secciones, se ve bien en celular", "monitor", 375, 300, 750, 25],
  ["Tienda online", "Catálogo, carrito y pedidos", "shopping-bag", 675, 600, 1875, 45],
  ["Sistema de reservas/citas", "Para salones, clínicas, barberías y consultorios", "calendar-check", 450, 375, 1125, 35],
  ["Menú digital con QR", "Para restaurantes y cafeterías", "utensils", 90, 75, 225, 11],
  ["Portafolio/CV web", "Para profesionales y freelancers", "palette", 135, 115, 300, 15],
  ["Rediseño de sitio existente", "Tu web de siempre, moderna y rápida", "rocket", 225, 190, 600, 25],
  [
    "Automatizaciones/chatbot de WhatsApp",
    "Respuestas automáticas, pedidos y recordatorios",
    "message-circle",
    265,
    225,
    675,
    30,
  ],
  ["Sistema de inventario", "Productos, stock, entradas, salidas y alertas de stock bajo", "blocks", 600, 525, 1500, 45],
  ["Sistema a la medida", "Inventario, facturación, punto de venta o CRM sencillo", "code", 900, 750, 3000, 60],
  ["App móvil", "iOS y Android", "smartphone", 1125, 900, 3750, 70],
  ["Panel admin", "Gestión interna del negocio", "layout-dashboard", 525, 450, 1500, 40],
];

// [name, description, icon, price, market min, market max, unit, required] in US$.
const extras: [string, string, string, number, number, number, Unit, boolean][] = [
  ["Páginas adicionales", "Cada página extra", "files", 30, 25, 65, "EACH", false],
  ["Panel de administración", "Para editar tu contenido", "layout-dashboard", 265, 225, 750, "ONCE", false],
  ["Reservas y citas", "Formulario + calendario", "calendar-check", 150, 150, 450, "ONCE", false],
  ["Integración de pagos (Azul, CardNet, PayPal)", "Cobra con tarjeta en tu web", "credit-card", 165, 150, 490, "ONCE", false],
  ["Login de usuarios", "Cuentas para tus clientes", "lock-keyhole", 115, 115, 300, "ONCE", false],
  ["Notificaciones por WhatsApp", "Avisos automáticos", "bell-ring", 90, 75, 265, "ONCE", false],
  ["Dominio y hosting del primer año", ".com + certificado SSL", "globe", 50, 45, 100, "ONCE", false],
  ["Correos corporativos", "tunombre@empresa.com", "mail", 30, 25, 90, "ONCE", false],
  ["SEO básico y Google Business Profile", "Para que te encuentren en Google y Maps", "search", 90, 75, 300, "ONCE", false],
  ["Multiidioma (español/inglés)", "Tu web en dos idiomas", "globe", 115, 90, 340, "ONCE", false],
  ["Blog autoadministrable", "Publica tus artículos tú misma", "files", 135, 115, 375, "ONCE", false],
  ["Redacción de textos o fotos de producto", "Contenido listo para tu web", "camera", 75, 60, 265, "ONCE", false],
  ["Logo o mini kit de marca", "Logo, colores y tipografías", "palette", 90, 75, 300, "ONCE", false],
  // Recurring income: maintenance and hosting always go in.
  ["Mantenimiento mensual", "Actualizaciones, respaldos y cambios pequeños", "wrench", 25, 19, 130, "MONTHLY", true],
  ["Hosting administrado", "Servidor, SSL y respaldos, cobrado mensual", "rocket", 11, 8, 40, "MONTHLY", true],
  ["Soporte prioritario", "Respuesta el mismo día", "bell-ring", 30, 25, 90, "MONTHLY", false],
];

type Line = { name: string; description?: string; icon: string; quantity?: number; unitPrice: number; unit?: Unit };

const webLines: Line[] = [
  { name: "Página web (5 secciones)", description: "Diseño responsive, hasta 5 secciones", icon: "monitor", unitPrice: 500 },
  {
    name: "Páginas adicionales",
    description: "Nosotros, Menú, Galería",
    icon: "files",
    quantity: 3,
    unitPrice: 50,
    unit: "EACH",
  },
  { name: "Reservas y citas", description: "Formulario + calendario", icon: "calendar-check", unitPrice: 250 },
  { name: "Notificaciones por WhatsApp", description: "Aviso de cada reserva", icon: "bell-ring", unitPrice: 135 },
  { name: "Dominio + hosting (1er año)", description: ".com + certificado SSL", icon: "globe", unitPrice: 65 },
];

const lines = (ls: Line[]) =>
  ls.map((l, i) => ({
    name: l.name,
    description: l.description ?? "",
    icon: l.icon,
    quantity: l.quantity ?? 1,
    unitPrice: usd(l.unitPrice),
    unit: l.unit ?? "ONCE",
    sortOrder: i,
  }));

// `npm run db:seed`: settings + catalog only, never deletes anything (safe on Neon).
// `npm run db:seed:demo`: wipes everything and loads sample clients, quotes and invoices.
const DEMO = process.argv.includes("--demo");

async function main() {
  if (DEMO) {
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quoteItem.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.client.deleteMany();
    await prisma.catalogItem.deleteMany();
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {}, // never overwrite what was saved from Admin → Ajustes
    create: {
      id: 1,
      whatsapp: "19089068105",
      dopRate: 61.1,
      messageTemplate: DEFAULT_TEMPLATE,
      businessName: "Priscila Pérez · Desarrollo de software",
      taxId: "",
      ownerName: "Priscila Pérez",
      ownerRole: "Desarrolladora de Software",
      portfolioUrl: "",
    },
  });

  if ((await prisma.catalogItem.count()) > 0) {
    console.log("El catálogo ya tiene servicios: no se toca.");
  } else
    await prisma.catalogItem.createMany({
      data: [
        ...projects.map(([name, description, icon, price, min, max, maintenance], i) => ({
          kind: "PROJECT" as const,
          name,
          description,
          icon,
          price: usd(price),
          minPrice: usd(min),
          maxPrice: usd(max),
          maintenancePrice: usd(maintenance),
          sortOrder: i,
        })),
        ...extras.map(([name, description, icon, price, min, max, unit, required], i) => ({
          kind: "EXTRA" as const,
          name,
          description,
          icon,
          price: usd(price),
          minPrice: usd(min),
          maxPrice: usd(max),
          unit,
          required,
          sortOrder: i,
        })),
      ],
    });

  if (!DEMO) {
    console.log("Ajustes y catálogo listos.");
    return;
  }

  const c = async (name: string, contact: string, phone: string, notes = "") =>
    prisma.client.create({ data: { name, contact, phone, notes } });

  const cafe = await c(
    "Café Colonial",
    "Laura Méndez",
    "809-555-0142",
    "Prefiere que le escriba por la tarde. Quiere sumar menú digital en enero.",
  );
  const salon = await c("Salón Bella Vista", "Yanet Rosario", "829-555-0198");
  const ferre = await c("Ferretería Ozama", "Ramón Peña", "809-555-0111");
  const clinica = await c("Clínica Sonrisa", "Dra. Ana Cruz", "849-555-0170");
  const barber = await c("Barbería El Corte", "Luis Batista", "809-555-0133");
  const tienda = await c("Tienda Mía RD", "Carla Núñez", "829-555-0155");
  const gym = await c("Gym Fuerza Norte", "Jonathan Reyes", "809-555-0187");
  const colegio = await c("Colegio Horizonte", "Marta Gil", "809-555-0102");

  // Quotes
  const cafeQuote = await prisma.quote.create({
    data: {
      clientId: cafe.id,
      title: "Página web + reservas",
      status: "ACCEPTED",
      source: "PUBLIC",
      discountPct: 0,
      notes: "Queremos que los clientes reserven mesa desde Instagram.",
      validUntil: inDays(15),
      seenAt: daysAgo(9),
      createdAt: daysAgo(10),
      items: { create: lines(webLines) },
    },
  });
  await prisma.quote.create({
    data: {
      clientId: colegio.id,
      title: "Sistema a medida",
      status: "REJECTED",
      validUntil: daysAgo(2),
      createdAt: daysAgo(11),
      items: {
        create: lines([{ name: "Sistema a medida", description: "Inscripciones y notas", icon: "blocks", unitPrice: 2350 }]),
      },
    },
  });
  await prisma.quote.create({
    data: {
      clientId: barber.id,
      title: "Landing + WhatsApp",
      status: "ACCEPTED",
      validUntil: inDays(10),
      createdAt: daysAgo(4),
      items: {
        create: lines([
          { name: "Landing page", icon: "layout-template", unitPrice: 250 },
          { name: "Notificaciones por WhatsApp", icon: "bell-ring", unitPrice: 135 },
        ]),
      },
    },
  });
  await prisma.quote.create({
    data: {
      clientId: tienda.id,
      title: "Tienda online + pagos",
      status: "DRAFT",
      validUntil: inDays(14),
      createdAt: daysAgo(1),
      items: {
        create: lines([
          { name: "Tienda online", icon: "shopping-bag", unitPrice: 1000 },
          { name: "Pagos en línea", icon: "credit-card", unitPrice: 250 },
          { name: "Login de usuarios", icon: "lock-keyhole", unitPrice: 175 },
          { name: "Páginas adicionales", icon: "files", quantity: 1, unitPrice: 50, unit: "EACH" },
          { name: "Dominio + hosting (1er año)", icon: "globe", unitPrice: 35 },
        ]),
      },
    },
  });
  // Fresh proposals from the public builder (unseen)
  await prisma.quote.create({
    data: {
      clientId: cafe.id,
      title: "Página web · 4 extras",
      status: "PENDING",
      source: "PUBLIC",
      notes: "Queremos que los clientes reserven mesa desde Instagram.",
      validUntil: inDays(15),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      items: { create: lines(webLines) },
    },
  });
  await prisma.quote.create({
    data: {
      clientId: barber.id,
      title: "Landing page · 2 extras",
      status: "PENDING",
      source: "PUBLIC",
      validUntil: inDays(15),
      createdAt: daysAgo(1),
      items: {
        create: lines([
          { name: "Landing page", icon: "layout-template", unitPrice: 250 },
          { name: "Notificaciones por WhatsApp", icon: "bell-ring", unitPrice: 70 },
          { name: "Dominio + hosting (1er año)", icon: "globe", unitPrice: 65 },
        ]),
      },
    },
  });

  // Invoices
  const inv = (
    clientId: string,
    title: string,
    ls: Line[],
    o: { sent?: boolean; issued: number; due: number; quoteId?: string; payments?: [number, number, string][] },
  ) =>
    prisma.invoice.create({
      data: {
        clientId,
        title,
        quoteId: o.quoteId,
        sent: o.sent ?? true,
        issuedAt: daysAgo(o.issued),
        dueAt: o.due >= 0 ? inDays(o.due) : daysAgo(-o.due),
        items: { create: lines(ls) },
        payments: {
          create: (o.payments ?? []).map(([amount, ago, method]) => ({ amount: usd(amount), paidAt: daysAgo(ago), method })),
        },
      },
    });

  await inv(
    barber.id,
    "Landing + WhatsApp",
    [
      { name: "Landing page", icon: "layout-template", unitPrice: 250 },
      { name: "Notificaciones por WhatsApp", icon: "bell-ring", unitPrice: 135 },
    ],
    { issued: 24, due: -10, payments: [[385, 12, "Transferencia Popular"]] },
  );
  await inv(
    clinica.id,
    "Panel admin + citas",
    [
      { name: "Panel admin", icon: "layout-dashboard", unitPrice: 950 },
      { name: "Reservas y citas", icon: "calendar-check", unitPrice: 250 },
    ],
    { issued: 45, due: -29 },
  );
  await inv(
    ferre.id,
    "Tienda online",
    [
      { name: "Tienda online", icon: "shopping-bag", unitPrice: 1350 },
      { name: "Pagos en línea", icon: "credit-card", unitPrice: 250 },
    ],
    { issued: 12, due: 18 },
  );
  await inv(cafe.id, "Página web", webLines, {
    issued: 8,
    due: 22,
    quoteId: cafeQuote.id,
    payments: [[550, 8, "Transferencia BHD"]],
  });
  await inv(
    salon.id,
    "Página web + reservas",
    [
      { name: "Página web", icon: "monitor", unitPrice: 720 },
      { name: "Reservas y citas", icon: "calendar-check", unitPrice: 250 },
    ],
    {
      issued: 5,
      due: 25,
      payments: [
        [485, 5, "Transferencia BHD"],
        [485, 2, "Efectivo"],
      ],
    },
  );
  await inv(gym.id, "Landing page", [{ name: "Landing page", icon: "layout-template", unitPrice: 300 }], {
    sent: false,
    issued: 0,
    due: 30,
  });

  console.log("Datos de prueba cargados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
