import { MessageCircle, Pencil, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton, PageShell } from "@/components/admin";
import { CatalogIcon } from "@/components/icon";
import { ProfilePhoto } from "@/components/profile-photo";
import { buttonClass } from "@/components/ui";
import { getInvoice, getSettings } from "@/lib/data";
import { formatDate, invoiceNumber } from "@/lib/format";
import { getAdminMoney } from "@/lib/admin-money";
import { markInvoiceSent } from "../../../actions";
import { InvoiceSummaryCard, PendingRow, reminderLink, reminderProblem, reminderText } from "../invoice-parts";
import { DeleteInvoiceButton, PaymentForm, PaymentList, PrintButton } from "./invoice-client";

export default async function InvoiceDetail({ params }: PageProps<"/admin/facturas/[id]">) {
  const { id } = await params;
  const [inv, settings, { fmt }] = await Promise.all([getInvoice(id), getSettings(), getAdminMoney()]);
  if (!inv) notFound();
  const reminder = reminderLink(inv);
  const t = inv.totals;

  return (
    <PageShell className="max-w-[1100px] print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <BackButton href="/admin/facturas" />
        <span className="text-base font-bold">{invoiceNumber(inv.number)}</span>
        <Link
          href={`/admin/facturas/${inv.id}/editar`}
          aria-label="Editar factura"
          className="grid size-10 place-items-center rounded-full bg-surface shadow-card"
        >
          <Pencil size={18} />
        </Link>
      </div>

      {/* Print header */}
      <div className="hidden items-center gap-4 print:flex">
        <ProfilePhoto size={64} />
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{settings.businessName}</span>
          {settings.taxId && <span className="text-sm">RNC: {settings.taxId}</span>}
          <span className="text-sm">
            Factura {invoiceNumber(inv.number)} · {formatDate(inv.issuedAt)} · vence {formatDate(inv.dueAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="card rounded-[28px] p-5 print:shadow-none">
            <InvoiceSummaryCard inv={inv} />
          </div>

          <section className="card flex flex-col px-[18px] py-1.5 print:shadow-none">
            <h2 className="pt-3 pb-1 text-[17px] font-bold">Partidas</h2>
            {inv.items
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((it) => (
                <div key={it.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-bg text-ink-2 print:hidden">
                    <CatalogIcon name={it.icon} size={17} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-semibold">{it.name}</span>
                    <span className="text-xs text-muted">
                      {it.quantity} × {fmt(it.unitPrice)}
                      {it.unit === "MONTHLY" && "/mes"}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{fmt(it.quantity * it.unitPrice)}</span>
                </div>
              ))}
            <div className="flex flex-col gap-2 border-t border-line py-3.5 text-sm">
              <Row label="Subtotal" value={fmt(t.subtotal)} />
              {t.discount > 0 && <Row label={`Descuento (${inv.discountPct}%)`} value={`−${fmt(t.discount)}`} />}
              {t.tax > 0 && <Row label="ITBIS 18%" value={fmt(t.tax)} />}
              <Row label="Total" value={fmt(t.total)} strong />
            </div>
          </section>
          {inv.notes && (
            <p className="rounded-[20px] bg-[#FFF8DD] p-4 text-[13px] leading-relaxed whitespace-pre-line text-[#5E4A00]">
              {inv.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5 print:hidden">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-bold tracking-[-0.015em]">Abonos</h2>
              <span className="text-[13px] text-muted">{inv.payments.length}</span>
            </div>
            <div className="card flex flex-col gap-3 px-[18px] py-4">
              <PaymentList payments={inv.payments} />
              {inv.pending > 0 && <PendingRow amount={inv.pending} />}
            </div>
          </section>

          {inv.pending > 0 && <PaymentForm invoiceId={inv.id} pending={inv.pending} total={inv.total} />}

          <div className="flex flex-col gap-2.5">
            {!inv.sent && (
              <form action={markInvoiceSent.bind(null, inv.id)}>
                <button className={buttonClass("dark", "w-full")}>
                  <Send size={18} /> Marcar como enviada
                </button>
              </form>
            )}
            {inv.pending > 0 && inv.sent && (
              <section className="flex flex-col gap-2.5 rounded-3xl bg-[#EFEAE2] p-4" aria-label="Recordatorio por WhatsApp">
                <span className="text-[13px] font-semibold text-[#54656F]">Recordatorio por WhatsApp</span>
                <p className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 text-xs leading-relaxed whitespace-pre-line text-[#111B21]">
                  {reminderText(inv)}
                </p>
                {reminder ? (
                  <a href={reminder} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "w-full")}>
                    <MessageCircle size={19} /> Enviar recordatorio
                  </a>
                ) : (
                  <p role="alert" className="text-xs font-medium text-[#8A2323]">
                    {reminderProblem(inv)}{" "}
                    <Link href={`/admin/clientes/${inv.client.id}`} className="underline">
                      Corregir en la ficha del cliente
                    </Link>
                  </p>
                )}
              </section>
            )}
            <PrintButton />
            <DeleteInvoiceButton id={inv.id} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={strong ? "font-bold" : "text-ink-2"}>{label}</span>
      <span className={strong ? "text-xl font-bold tabular-nums" : "font-medium tabular-nums"}>{value}</span>
    </div>
  );
}
