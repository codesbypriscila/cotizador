import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui";
import type { InvoiceSummary } from "@/lib/data";
import { InvoiceSummaryCard, PaymentRow, PendingRow, reminderLink } from "./invoice-parts";

/** Desktop side panel for the selected invoice. */
export function InvoicePanel({ invoice: inv }: { invoice: InvoiceSummary }) {
  const reminder = reminderLink(inv);
  return (
    <aside className="card flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto p-[22px] xl:w-[380px]">
      <InvoiceSummaryCard inv={inv} compact />
      <h3 className="pt-1 text-[15px] font-bold">Abonos</h3>
      <div className="flex flex-col gap-3">
        {inv.payments.length === 0 && <p className="text-sm text-muted">Todavía no hay abonos.</p>}
        {inv.payments.map((p) => (
          <PaymentRow key={p.id} {...p} />
        ))}
        {inv.pending > 0 && inv.payments.length > 0 && <PendingRow amount={inv.pending} />}
      </div>
      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <div className="flex gap-2.5">
          <Link href={`/admin/facturas/${inv.id}#abono`} className={buttonClass("dark", "h-[46px] flex-1 px-4 text-sm")}>
            Registrar abono
          </Link>
          {reminder && (
            <a
              href={reminder}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "h-[46px] flex-1 px-4 text-sm")}
            >
              <MessageCircle size={17} /> Recordar
            </a>
          )}
        </div>
        <Link
          href={`/admin/facturas/${inv.id}`}
          className="flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-accent-ink"
        >
          Ver detalle <ArrowRight size={15} />
        </Link>
      </div>
    </aside>
  );
}
