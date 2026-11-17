// Totals and statuses shared by quotes and invoices.

export const TAX_RATE = 0.18; // ITBIS
export const URGENT_SURCHARGE = 0.2;

export type LineLike = {
  quantity: number;
  unitPrice: number;
  unit: "ONCE" | "EACH" | "MONTHLY";
};

export type Totals = {
  subtotal: number;
  urgentFee: number;
  discount: number;
  tax: number;
  total: number;
  monthly: number; // recurring items, shown apart
};

export function computeTotals(
  lines: LineLike[],
  opts: { discountPct?: number; applyTax?: boolean; urgent?: boolean } = {},
): Totals {
  let subtotal = 0;
  let monthly = 0;
  for (const l of lines) {
    const amount = l.quantity * l.unitPrice;
    if (l.unit === "MONTHLY") monthly += amount;
    else subtotal += amount;
  }
  const urgentFee = opts.urgent ? Math.round(subtotal * URGENT_SURCHARGE) : 0;
  const base = subtotal + urgentFee;
  const discount = Math.round((base * (opts.discountPct ?? 0)) / 100);
  const taxable = base - discount;
  const tax = opts.applyTax ? Math.round(taxable * TAX_RATE) : 0;
  return { subtotal, urgentFee, discount, tax, total: taxable + tax, monthly };
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE";
export type DocStatus = InvoiceStatus | "ACCEPTED" | "REJECTED";

/** Invoice status is derived: draft flag, payments and due date. */
export function invoiceStatus(input: { sent: boolean; total: number; paid: number; dueAt: Date; now?: Date }): InvoiceStatus {
  if (!input.sent) return "DRAFT";
  if (input.total > 0 && input.paid >= input.total) return "PAID";
  if ((input.now ?? new Date()) > input.dueAt) return "OVERDUE";
  if (input.paid > 0) return "PARTIAL";
  return "SENT";
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PARTIAL: "Parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
};
