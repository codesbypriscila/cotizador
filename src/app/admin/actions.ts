"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_CURRENCY_COOKIE } from "@/lib/admin-money";
import { getServerEnv } from "@/lib/env";
import { verifyPassword } from "@/lib/password";
import { parseUSD } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getRate } from "@/lib/rate";
import { computeTotals, DEPOSIT_PCT } from "@/lib/totals";
import { businessNameError, emailError, personNameError, phoneError, tidy } from "@/lib/validation";
import { createSessionToken, SESSION_COOKIE, SESSION_DAYS } from "@/lib/session";

// ─── Session ────────────────────────────────────────────────────────────────

export async function login(_prev: { error?: string; email?: string } | undefined, form: FormData) {
  const env = getServerEnv();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y tu contraseña.", email };
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    await new Promise((r) => setTimeout(r, 600)); // slows down guessing
    // The form resets after an action: send the email back so it stays filled in.
    return { error: "Correo o contraseña incorrectos.", email };
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(admin.email, env.SESSION_SECRET), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Runs one of the shared field rules (lib/validation) inside a zod schema. */
const rule = (check: (v: string) => string | null) =>
  z
    .string()
    .transform(tidy)
    .superRefine((v, ctx) => {
      const error = check(v);
      if (error) ctx.addIssue({ code: "custom", message: error });
    });

/** First message per field, for showing errors under each input. */
function fieldErrors(e: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });

// ─── Quotes and invoices (shared editor) ────────────────────────────────────

const unit = z.enum(["ONCE", "EACH", "MONTHLY"]);
const line = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(200).default(""),
  icon: z.string().max(40).default("circle"),
  quantity: z.number().int().min(1).max(999),
  unitPrice: z.number().int().min(0).max(100_000_000),
  unit,
});

const clientRef = z.union([
  z.object({ id: z.string().min(1) }),
  z.object({
    newName: rule(businessNameError),
    phone: z
      .string()
      .trim()
      .max(30)
      .default("")
      .superRefine((v, ctx) => {
        const error = phoneError(v);
        if (error) ctx.addIssue({ code: "custom", message: error });
      }),
  }),
]);

const docBase = z.object({
  client: clientRef,
  title: z.string().trim().min(1).max(120),
  discountPct: z.number().int().min(0).max(100),
  applyTax: z.boolean(),
  notes: z.string().trim().max(2000),
  items: z.array(line).min(1).max(60),
});

const quoteSchema = docBase.extend({
  status: z.enum(["DRAFT", "PENDING", "SENT", "ACCEPTED", "REJECTED"]),
  urgent: z.boolean(),
  validUntil: z.string().nullable(), // yyyy-mm-dd
  deadline: z.string().nullable(), // yyyy-mm-dd, delivery date agreed with the client
});

const invoiceSchema = docBase.extend({
  sent: z.boolean(),
  issuedAt: z.string().min(1),
  dueAt: z.string().min(1),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type InvoiceInput = z.input<typeof invoiceSchema>;
type Result = { ok: true; id: string } | { ok: false; error: string };

const day = (s: string) => new Date(`${s}T12:00:00-04:00`); // noon in Santo Domingo, no TZ drift

async function resolveClient(ref: z.infer<typeof clientRef>) {
  if ("id" in ref) return ref.id;
  const c = await prisma.client.create({ data: { name: ref.newName, phone: ref.phone } });
  return c.id;
}

const itemRows = (items: z.infer<typeof line>[]) => items.map((it, i) => ({ ...it, sortOrder: i }));

function firstError(e: z.ZodError) {
  const issue = e.issues[0];
  if (issue?.path[0] === "items") return "Revisa las partidas: cada una necesita nombre y precio.";
  if (issue?.path[0] === "title") return "Escribe una descripción corta del proyecto.";
  if (issue?.path[0] === "client")
    return issue.path.length > 1 && issue.code === "custom" ? `Cliente nuevo: ${issue.message}` : "Elige o crea un cliente.";
  return "Revisa los datos del formulario.";
}

export async function saveQuote(id: string | null, input: QuoteInput): Promise<Result> {
  await requireAdmin();
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const clientId = await resolveClient(d.client);
  const data = {
    clientId,
    title: d.title,
    status: d.status,
    discountPct: d.discountPct,
    applyTax: d.applyTax,
    urgent: d.urgent,
    notes: d.notes,
    validUntil: d.validUntil ? day(d.validUntil) : null,
    deadline: d.deadline ? day(d.deadline) : null,
  };
  const saved = id
    ? await prisma.quote.update({
        where: { id },
        data: { ...data, items: { deleteMany: {}, create: itemRows(d.items) } },
      })
    : await prisma.quote.create({ data: { ...data, items: { create: itemRows(d.items) } } });
  revalidatePath("/admin", "layout");
  return { ok: true, id: saved.id };
}

export async function setQuoteStatus(id: string, status: "DRAFT" | "PENDING" | "SENT" | "ACCEPTED" | "REJECTED") {
  await requireAdmin();
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteQuote(id: string) {
  await requireAdmin();
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/cotizaciones");
}

/** New draft with the same client and items, to reuse a quote as a starting point. */
export async function duplicateQuote(id: string) {
  await requireAdmin();
  const q = await prisma.quote.findUniqueOrThrow({ where: { id }, include: { items: true } });
  const copy = await prisma.quote.create({
    data: {
      clientId: q.clientId,
      title: `${q.title} (copia)`.slice(0, 120),
      status: "DRAFT",
      source: "ADMIN",
      discountPct: q.discountPct,
      applyTax: q.applyTax,
      urgent: q.urgent,
      currency: q.currency,
      notes: q.notes,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: {
        create: q.items.map(({ name, description, icon, quantity, unitPrice, unit, sortOrder }) => ({
          name,
          description,
          icon,
          quantity,
          unitPrice,
          unit,
          sortOrder,
        })),
      },
    },
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/cotizaciones/${copy.id}`);
}

type QuoteWithItems = Prisma.QuoteGetPayload<{ include: { items: true } }>;

/** New invoice with the quote's one-time items (urgent surcharge included); due on the delivery date or in 30 days. */
async function createInvoiceFromQuote(q: QuoteWithItems, opts: { sent?: boolean } = {}) {
  const urgentNote = q.urgent ? "Incluye plazo urgente (+20%)." : "";
  const items = q.items
    .filter((i) => i.unit !== "MONTHLY")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ name, description, icon, quantity, unitPrice, unit, sortOrder }) => ({
      name,
      description,
      icon,
      quantity,
      unitPrice: q.urgent ? Math.round(unitPrice * 1.2) : unitPrice,
      unit,
      sortOrder,
    }));
  return prisma.invoice.create({
    data: {
      clientId: q.clientId,
      quoteId: q.id,
      title: q.title,
      sent: opts.sent ?? false,
      discountPct: q.discountPct,
      applyTax: q.applyTax,
      notes: [q.notes, urgentNote].filter(Boolean).join("\n"),
      dueAt: q.deadline ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: { create: items },
    },
    include: { items: true },
  });
}

/** Copies the quote into a new draft invoice and marks the quote accepted. */
export async function convertQuoteToInvoice(quoteId: string) {
  await requireAdmin();
  const q = await prisma.quote.findUniqueOrThrow({ where: { id: quoteId }, include: { items: true, invoice: true } });
  if (q.invoice) redirect(`/admin/facturas/${q.invoice.id}`);
  const inv = await createInvoiceFromQuote(q);
  await prisma.quote.update({ where: { id: q.id }, data: { status: "ACCEPTED" } });
  revalidatePath("/admin", "layout");
  redirect(`/admin/facturas/${inv.id}`);
}

/**
 * The client paid the 30 % deposit to start the work: the quote becomes an
 * invoice (if it was not one yet) with that first payment recorded.
 */
export async function registerDeposit(quoteId: string) {
  await requireAdmin();
  const q = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { items: true, invoice: { include: { items: true, payments: true } } },
  });
  if (q.invoice && q.invoice.payments.length > 0) redirect(`/admin/facturas/${q.invoice.id}`);
  const inv = q.invoice ?? (await createInvoiceFromQuote(q, { sent: true }));
  const total = computeTotals(inv.items, { discountPct: inv.discountPct, applyTax: inv.applyTax }).total;
  await prisma.payment.create({
    data: {
      invoiceId: inv.id,
      amount: Math.round((total * DEPOSIT_PCT) / 100),
      paidAt: day(today()),
      method: "Transferencia",
      note: `Anticipo del ${DEPOSIT_PCT}%`,
    },
  });
  await prisma.invoice.update({ where: { id: inv.id }, data: { sent: true } });
  await prisma.quote.update({ where: { id: q.id }, data: { status: "ACCEPTED" } });
  revalidatePath("/admin", "layout");
  redirect(`/admin/facturas/${inv.id}`);
}

/** US$ or RD$ for every amount in the admin. */
export async function setAdminCurrency(currency: "USD" | "DOP") {
  await requireAdmin();
  (await cookies()).set(ADMIN_CURRENCY_COOKIE, currency === "DOP" ? "DOP" : "USD", {
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/admin", "layout");
}

export async function saveInvoice(id: string | null, input: InvoiceInput): Promise<Result> {
  await requireAdmin();
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;
  const clientId = await resolveClient(d.client);
  const data = {
    clientId,
    title: d.title,
    sent: d.sent,
    discountPct: d.discountPct,
    applyTax: d.applyTax,
    notes: d.notes,
    issuedAt: day(d.issuedAt),
    dueAt: day(d.dueAt),
  };
  const saved = id
    ? await prisma.invoice.update({
        where: { id },
        data: { ...data, items: { deleteMany: {}, create: itemRows(d.items) } },
      })
    : await prisma.invoice.create({ data: { ...data, items: { create: itemRows(d.items) } } });
  revalidatePath("/admin", "layout");
  return { ok: true, id: saved.id };
}

export async function markInvoiceSent(id: string) {
  await requireAdmin();
  await prisma.invoice.update({ where: { id }, data: { sent: true } });
  revalidatePath("/admin", "layout");
}

export async function deleteInvoice(id: string) {
  await requireAdmin();
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/facturas");
}

const paymentSchema = z.object({
  amount: z.number({ message: "Escribe el monto en US$." }).int().min(1, "El monto debe ser mayor que cero."), // US dollar cents
  paidAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige la fecha del pago.")
    .refine((d) => d <= today(), "La fecha no puede ser en el futuro."),
  method: z.string().trim().min(2, "Escribe cómo te pagaron.").max(60, "Máximo 60 caracteres."),
  note: z.string().trim().max(200, "Máximo 200 caracteres.").default(""),
});

export async function addPayment(invoiceId: string, _prev: unknown, form: FormData) {
  await requireAdmin();
  const rawAmount = String(form.get("amount") ?? "").trim();
  if (rawAmount && !/^[\d,]+(\.\d{1,2})?$/.test(rawAmount.replace(/^US\$\s*/, ""))) {
    return { fieldErrors: { amount: "Usa solo números, con hasta 2 decimales (ej.: 250.50)." } };
  }
  const parsed = paymentSchema.safeParse({
    amount: parseUSD(rawAmount),
    paidAt: String(form.get("paidAt") ?? ""),
    method: String(form.get("method") ?? ""),
    note: String(form.get("note") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  // Never record more than what is still owed.
  const inv = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { items: true, payments: true } });
  const total = computeTotals(inv.items, { discountPct: inv.discountPct, applyTax: inv.applyTax }).total;
  const pending = total - inv.payments.reduce((sum, p) => sum + p.amount, 0);
  if (pending <= 0) return { error: "Esta factura ya está pagada completa." };
  if (parsed.data.amount > pending) {
    return {
      fieldErrors: {
        amount: `No puede ser más de lo pendiente (US$${(pending / 100).toLocaleString("en-US", { minimumFractionDigits: pending % 100 ? 2 : 0 })}).`,
      },
    };
  }
  const { paidAt, ...rest } = parsed.data;
  await prisma.payment.create({ data: { invoiceId, ...rest, paidAt: day(paidAt) } });
  await prisma.invoice.update({ where: { id: invoiceId }, data: { sent: true } });
  revalidatePath("/admin", "layout");
  return { error: undefined, ok: Date.now() };
}

export async function deletePayment(id: string) {
  await requireAdmin();
  await prisma.payment.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

// ─── Clients ────────────────────────────────────────────────────────────────

const clientSchema = z.object({
  name: rule(businessNameError),
  contact: rule((v) => (v ? personNameError(v) : null)),
  phone: rule((v) => phoneError(v)),
  email: rule(emailError),
  notes: z.string().trim().max(2000, "Máximo 2,000 caracteres."),
});

export async function saveClient(id: string | null, _prev: unknown, form: FormData) {
  await requireAdmin();
  const parsed = clientSchema.safeParse(
    Object.fromEntries(["name", "contact", "phone", "email", "notes"].map((k) => [k, form.get(k) ?? ""])),
  );
  if (!parsed.success) {
    // The form resets after an action: send back what was typed so it stays on screen.
    const values = Object.fromEntries(["name", "contact", "phone", "email", "notes"].map((k) => [k, String(form.get(k) ?? "")]));
    return { fieldErrors: fieldErrors(parsed.error), values };
  }
  const saved = id
    ? await prisma.client.update({ where: { id }, data: parsed.data })
    : await prisma.client.create({ data: parsed.data });
  revalidatePath("/admin", "layout");
  if (!id) redirect(`/admin/clientes/${saved.id}`);
  return { error: undefined, ok: Date.now() };
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/clientes");
}

// ─── Catalog ────────────────────────────────────────────────────────────────

const money = z.coerce.number().int().min(0).max(100_000_000);
const catalogSchema = z.object({
  kind: z.enum(["PROJECT", "EXTRA"]),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(120),
  icon: z.string().min(1).max(40),
  price: money,
  minPrice: money,
  maxPrice: money,
  unit: unit,
  visible: z.boolean(),
  required: z.boolean(),
  maintenancePrice: z.number().int().min(0).max(100_000_000).nullable(),
});

const digits = (v: FormDataEntryValue | null) => String(v ?? "").replace(/[^\d]/g, "");

export async function saveCatalogItem(id: string | null, _prev: unknown, form: FormData) {
  await requireAdmin();
  const parsed = catalogSchema.safeParse({
    kind: form.get("kind"),
    name: form.get("name"),
    description: form.get("description") ?? "",
    icon: form.get("icon"),
    price: digits(form.get("price")),
    minPrice: digits(form.get("minPrice")) || digits(form.get("price")),
    maxPrice: digits(form.get("maxPrice")) || digits(form.get("price")),
    unit: form.get("unit") ?? "ONCE",
    visible: form.get("visible") === "on",
    required: form.get("required") === "on",
    maintenancePrice: digits(form.get("maintenancePrice")) ? Number(digits(form.get("maintenancePrice"))) : null,
  });
  if (!parsed.success) return { error: "Escribe el nombre y el precio base." };
  const d = parsed.data;
  if (d.kind === "PROJECT") {
    d.unit = "ONCE";
    d.required = false;
  } else d.maintenancePrice = null;
  if (id) {
    await prisma.catalogItem.update({ where: { id }, data: d });
  } else {
    const last = await prisma.catalogItem.aggregate({ where: { kind: d.kind }, _max: { sortOrder: true } });
    const created = await prisma.catalogItem.create({ data: { ...d, sortOrder: (last._max.sortOrder ?? 0) + 1 } });
    id = created.id;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/catalogo?tipo=${d.kind === "EXTRA" ? "extras" : "proyectos"}&id=${id}&guardado=1`);
}

export async function setCatalogVisible(id: string, visible: boolean) {
  await requireAdmin();
  await prisma.catalogItem.update({ where: { id }, data: { visible } });
  revalidatePath("/", "layout");
}

/** Swaps the item with its neighbour (dir -1 = up, 1 = down) inside its kind. */
export async function moveCatalogItem(id: string, dir: -1 | 1) {
  await requireAdmin();
  const item = await prisma.catalogItem.findUniqueOrThrow({ where: { id } });
  const list = await prisma.catalogItem.findMany({
    where: { kind: item.kind },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await prisma.$transaction(list.map((x, k) => prisma.catalogItem.update({ where: { id: x.id }, data: { sortOrder: k } })));
  revalidatePath("/", "layout");
}

export async function deleteCatalogItem(id: string) {
  await requireAdmin();
  const item = await prisma.catalogItem.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect(`/admin/catalogo?tipo=${item.kind === "EXTRA" ? "extras" : "proyectos"}`);
}

// ─── Settings ───────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  whatsapp: z
    .string()
    .superRefine((v, ctx) => {
      const error = phoneError(v, { required: true });
      if (error) ctx.addIssue({ code: "custom", message: error });
    })
    .transform((v) => v.replace(/\D/g, "")),
  businessName: z.string().trim().min(1).max(80),
  taxId: z.string().trim().max(30),
  ownerName: z.string().trim().min(1).max(60),
  ownerRole: z.string().trim().max(60),
  portfolioUrl: z.union([z.literal(""), z.string().trim().url().max(200)]),
});

export async function saveSettings(_prev: unknown, form: FormData) {
  await requireAdmin();
  const keys = ["whatsapp", "businessName", "taxId", "ownerName", "ownerRole", "portfolioUrl"];
  const parsed = settingsSchema.safeParse(Object.fromEntries(keys.map((k) => [k, form.get(k) ?? ""])));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const msg: Record<string, string> = {
      whatsapp: "WhatsApp: " + (parsed.error.issues.find((i) => i.path[0] === "whatsapp")?.message ?? "número no válido."),
      portfolioUrl: "El enlace del portafolio debe empezar con https://",
    };
    return { error: msg[String(field)] ?? "Revisa los datos." };
  }
  await prisma.settings.update({ where: { id: 1 }, data: parsed.data });
  revalidatePath("/", "layout");
  return { error: undefined, ok: Date.now() };
}

/** Fetches the dollar rate right away instead of waiting for the 6-hour refresh. */
export async function refreshRate() {
  await requireAdmin();
  await getRate({ force: true });
  revalidatePath("/", "layout");
}
