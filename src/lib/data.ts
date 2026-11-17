import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { computeTotals, type DocStatus, invoiceStatus } from "./totals";

const invoiceInclude = { client: true, items: true, payments: true } satisfies Prisma.InvoiceInclude;
const quoteInclude = { client: true, items: true } satisfies Prisma.QuoteInclude;

type InvoiceRow = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;
type QuoteRow = Prisma.QuoteGetPayload<{ include: typeof quoteInclude }>;

export function summarizeInvoice(inv: InvoiceRow, now = new Date()) {
  const totals = computeTotals(inv.items, { discountPct: inv.discountPct, applyTax: inv.applyTax });
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  const status = invoiceStatus({ sent: inv.sent, total: totals.total, paid, dueAt: inv.dueAt, now });
  return { ...inv, totals, total: totals.total, paid, pending: Math.max(0, totals.total - paid), status };
}
export type InvoiceSummary = ReturnType<typeof summarizeInvoice>;

export function summarizeQuote(q: QuoteRow) {
  const totals = computeTotals(q.items, { discountPct: q.discountPct, applyTax: q.applyTax, urgent: q.urgent });
  return { ...q, totals, total: totals.total, status: q.status as DocStatus };
}
export type QuoteSummary = ReturnType<typeof summarizeQuote>;

export async function getInvoices(where: Prisma.InvoiceWhereInput = {}) {
  const rows = await prisma.invoice.findMany({ where, include: invoiceInclude, orderBy: { issuedAt: "desc" } });
  const now = new Date();
  return rows.map((r) => summarizeInvoice(r, now));
}

export async function getInvoice(id: string) {
  const row = await prisma.invoice.findUnique({
    where: { id },
    include: { ...invoiceInclude, payments: { orderBy: { paidAt: "asc" } } },
  });
  return row ? summarizeInvoice(row) : null;
}

export async function getQuotes(where: Prisma.QuoteWhereInput = {}) {
  const rows = await prisma.quote.findMany({ where, include: quoteInclude, orderBy: { createdAt: "desc" } });
  return rows.map(summarizeQuote);
}

export async function getQuote(id: string) {
  const row = await prisma.quote.findUnique({
    where: { id },
    include: { ...quoteInclude, items: { orderBy: { sortOrder: "asc" } }, invoice: true },
  });
  return row ? { ...summarizeQuote(row), invoice: row.invoice } : null;
}

export async function getSettings() {
  const s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) throw new Error("Settings row missing: run npm run db:seed");
  return s;
}

/** Text search shared by list pages. */
export function matches(q: string | undefined, ...fields: (string | null | undefined)[]) {
  if (!q) return true;
  const needle = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return fields.some((f) =>
    f
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .includes(needle),
  );
}
