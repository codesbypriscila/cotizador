import { Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { DocCard, EmptyState, FilterChips, PageHeader, PageShell, SearchBox } from "@/components/admin";
import { Avatar, buttonClass, cx, StatusBadge } from "@/components/ui";
import { getInvoices, matches } from "@/lib/data";
import { formatDate, formatDateShort, invoiceNumber } from "@/lib/format";
import { formatUSD } from "@/lib/money";
import type { InvoiceStatus } from "@/lib/totals";
import { InvoicePanel } from "./invoice-panel";

const FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "parcial", label: "Parcial" },
  { value: "pagada", label: "Pagada" },
  { value: "vencida", label: "Vencida" },
];
const STATUS: Record<string, InvoiceStatus> = {
  borrador: "DRAFT",
  enviada: "SENT",
  parcial: "PARTIAL",
  pagada: "PAID",
  vencida: "OVERDUE",
};

export default async function InvoicesPage({ searchParams }: PageProps<"/admin/facturas">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const estado = typeof sp.estado === "string" && STATUS[sp.estado] ? sp.estado : "todas";
  const selectedId = typeof sp.id === "string" ? sp.id : undefined;

  const all = await getInvoices();
  const list = all.filter(
    (i) => (estado === "todas" || i.status === STATUS[estado]) && matches(q, i.client.name, i.title, invoiceNumber(i.number)),
  );
  const selected = list.find((i) => i.id === selectedId) ?? list[0];
  const params = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ estado: estado === "todas" ? undefined : estado, q, ...extra })) if (v) p.set(k, v);
    return `/admin/facturas?${p}`;
  };

  return (
    <PageShell className="max-w-[1400px] lg:h-dvh lg:pb-8">
      <PageHeader
        title="Facturas"
        count={`${all.length} en total`}
        actions={
          <Link href="/admin/facturas/nueva" className={buttonClass("primary", "h-[46px] text-sm max-lg:hidden")}>
            <Plus size={18} /> Nueva factura
          </Link>
        }
      />
      <SearchBox
        placeholder="Buscar facturas…"
        q={q}
        hidden={{ estado: estado === "todas" ? undefined : estado }}
        className="lg:max-w-md"
      />
      <FilterChips
        options={FILTERS}
        active={estado}
        hrefFor={(v) => params({ estado: v === "todas" ? undefined : v, id: undefined })}
      />

      {list.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No hay facturas aquí">
          {q ? "Prueba con otra búsqueda." : "Convierte una cotización aceptada en factura."}
        </EmptyState>
      ) : (
        <>
          {/* Phone and iPad portrait: cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:hidden">
            {list.map((i) => (
              <DocCard
                key={i.id}
                href={`/admin/facturas/${i.id}`}
                icon={ReceiptText}
                title={i.client.name}
                subtitle={i.title}
                amount={formatUSD(i.total)}
                number={invoiceNumber(i.number)}
                status={i.status}
                date={formatDate(i.status === "DRAFT" ? i.issuedAt : i.dueAt)}
              />
            ))}
          </div>

          {/* Desktop: table + detail panel */}
          <div className="hidden min-h-0 flex-1 gap-5 lg:flex">
            <div className="card min-w-0 flex-1 overflow-y-auto px-[22px] py-2">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="px-2.5 py-3 font-medium">Cliente</th>
                    <th className="py-3 font-medium">Número</th>
                    <th className="py-3 font-medium">Estado</th>
                    <th className="py-3 font-medium">Vence</th>
                    <th className="px-2.5 py-3 text-right font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((i) => {
                    const sel = i.id === selected?.id;
                    return (
                      <tr key={i.id} className={cx("border-b border-line last:border-0", sel && "bg-accent-soft")}>
                        <td className="rounded-l-[14px] px-2.5 py-3">
                          <Link href={params({ id: i.id })} scroll={false} className="flex items-center gap-3">
                            <Avatar name={i.client.name} size={36} className={sel ? "bg-white!" : undefined} />
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold">{i.client.name}</span>
                              <span className="text-xs text-muted">{i.title}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="text-[13px] text-ink-2">{invoiceNumber(i.number)}</td>
                        <td>
                          <StatusBadge status={i.status} />
                        </td>
                        <td className="text-[13px] text-ink-2">{i.status === "DRAFT" ? "—" : formatDateShort(i.dueAt)}</td>
                        <td className="rounded-r-[14px] px-2.5 text-right text-sm font-semibold tabular-nums">
                          {formatUSD(i.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selected && <InvoicePanel invoice={selected} />}
          </div>
        </>
      )}
    </PageShell>
  );
}
