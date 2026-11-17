import { Calendar, Check, Clock3 } from "lucide-react";
import { cx, StatusBadge } from "@/components/ui";
import type { InvoiceSummary } from "@/lib/data";
import { formatDate, formatDateShort, invoiceNumber } from "@/lib/format";
import { formatUSD } from "@/lib/money";
import { phoneError } from "@/lib/validation";
import { whatsappLink } from "@/lib/whatsapp";

export function reminderText(inv: InvoiceSummary) {
  const who = inv.client.contact || inv.client.name;
  return (
    `Hola ${who} 👋 Te escribo por la factura ${invoiceNumber(inv.number)} (${inv.title}).\n` +
    `Total: ${formatUSD(inv.total)} · Pagado: ${formatUSD(inv.paid)}\n` +
    `Pendiente: ${formatUSD(inv.pending)}${inv.status === "OVERDUE" ? " (vencida)" : `, vence el ${formatDate(inv.dueAt)}`}.\n` +
    "¡Gracias!"
  );
}

/** Problem that stops a reminder, or null when it can be sent. */
export function reminderProblem(inv: InvoiceSummary): string | null {
  if (!inv.sent) return "Marca la factura como enviada para poder recordarla.";
  if (inv.pending <= 0) return null;
  if (!inv.client.phone) return `${inv.client.name} no tiene WhatsApp guardado.`;
  const error = phoneError(inv.client.phone);
  return error ? `El WhatsApp de ${inv.client.name} no es válido: ${error.toLowerCase()}` : null;
}

export function reminderLink(inv: InvoiceSummary) {
  if (inv.pending <= 0 || reminderProblem(inv)) return null;
  return whatsappLink(inv.client.phone, reminderText(inv));
}

export function InvoiceSummaryCard({ inv, compact }: { inv: InvoiceSummary; compact?: boolean }) {
  const pct = inv.total > 0 ? Math.min(100, Math.round((inv.paid / inv.total) * 100)) : 0;
  const days = Math.ceil((inv.dueAt.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {compact && <span className="text-[13px] font-semibold text-muted">{invoiceNumber(inv.number)}</span>}
          <span className={cx("font-bold", compact ? "text-xl" : "text-[17px] font-semibold")}>{inv.client.name}</span>
          <span className="text-[13px] text-muted">
            {inv.title} · emitida {formatDate(inv.issuedAt)}
          </span>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <div className="flex flex-col gap-0.5">
        {!compact && <span className="text-[13px] text-muted">Total</span>}
        <span className="text-[36px] font-bold tracking-[-0.035em] tabular-nums lg:text-[34px]">{formatUSD(inv.total)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-bg" role="progressbar" aria-valuenow={pct} aria-label="Pagado">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2.5">
        <div className="flex flex-1 flex-col gap-0.5 rounded-[14px] bg-bg px-3 py-2.5">
          <span className="text-xs text-muted">Pagado</span>
          <span className="font-bold text-accent-ink tabular-nums">{formatUSD(inv.paid)}</span>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 rounded-[14px] bg-bg px-3 py-2.5">
          <span className="text-xs text-muted">Pendiente</span>
          <span className="font-bold tabular-nums">{formatUSD(inv.pending)}</span>
        </div>
      </div>
      {inv.status !== "PAID" && (
        <p className="flex items-center gap-2 text-[13px] text-ink-2">
          <Calendar size={16} className="text-muted" />
          {inv.status === "DRAFT"
            ? `Borrador · vencería el ${formatDate(inv.dueAt)}`
            : days >= 0
              ? `Vence el ${formatDate(inv.dueAt)} · faltan ${days} ${days === 1 ? "día" : "días"}`
              : `Venció el ${formatDate(inv.dueAt)} · hace ${-days} ${days === -1 ? "día" : "días"}`}
        </p>
      )}
    </div>
  );
}

export function PaymentRow({ amount, paidAt, method, note }: { amount: number; paidAt: Date; method: string; note: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E9F8EF] text-[#1E8A4C]">
        <Check size={17} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold">{note || "Abono"}</span>
        <span className="truncate text-xs text-muted">
          {formatDateShort(paidAt)} · {method}
        </span>
      </span>
      <span className="text-sm font-semibold tabular-nums">{formatUSD(amount)}</span>
    </div>
  );
}

export function PendingRow({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bg text-muted">
        <Clock3 size={17} />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-semibold">Saldo pendiente</span>
        <span className="text-xs text-muted">Por cobrar</span>
      </span>
      <span className="text-sm font-semibold text-muted tabular-nums">{formatUSD(amount)}</span>
    </div>
  );
}
