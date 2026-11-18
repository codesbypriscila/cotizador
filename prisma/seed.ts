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

const projects: [string, string, string, number, number][] = [
  ["Landing page", "Una sola página para campañas", "layout-template", 250, 500],
  ["Página web", "Hasta 5 secciones, responsive", "monitor", 500, 1000],
  ["Tienda online", "Catálogo, carrito y pedidos", "shopping-bag", 1000, 2500],
  ["App móvil", "iOS y Android", "smartphone", 2000, 5000],
  ["Panel admin", "Gestión interna del negocio", "layout-dashboard", 850, 2000],
  ["Sistema a medida", "Se cotiza tras una llamada", "blocks", 1350, 4000],
];

const extras: [string, string, string, number, number, number, Unit][] = [
  ["Páginas adicionales", "Cada página extra", "files", 50, 35, 85, "EACH"],
  ["Panel de administración", "Para editar tu contenido", "layout-dashboard", 400, 400, 1000, "ONCE"],
  ["Reservas y citas", "Formulario + calendario", "calendar-check", 250, 250, 600, "ONCE"],
  ["Pagos en línea", "Tarjeta y transferencias", "credit-card", 250, 250, 650, "ONCE"],
  ["Login de usuarios", "Cuentas para tus clientes", "lock-keyhole", 175, 175, 400, "ONCE"],
  ["Notificaciones por WhatsApp", "Avisos automáticos", "bell-ring", 135, 135, 350, "ONCE"],
  ["Dominio + hosting (1er año)", ".com + certificado SSL", "globe", 65, 65, 135, "ONCE"],
  ["Mantenimiento mensual", "Cambios y soporte", "wrench", 50, 50, 170, "MONTHLY"],
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
        ...projects.map(([name, description, icon, min, max], i) => ({
          kind: "PROJECT" as const,
          name,
          description,
          icon,
          price: usd(min),
          minPrice: usd(min),
          maxPrice: usd(max),
          visible: name !== "Sistema a medida",
          sortOrder: i,
        })),
        ...extras.map(([name, description, icon, price, min, max, unit], i) => ({
          kind: "EXTRA" as const,
          name,
          description,
          icon,
          price: usd(price),
          minPrice: usd(min),
          maxPrice: usd(max),
          unit,
          required: name === "Mantenimiento mensual",
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
      status: "SENT",
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
      status: "SENT",
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
