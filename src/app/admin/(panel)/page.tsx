import { CircleExclamationPoint, FileText, Hourglass, Inbox, Layers, MessageCircle, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { DocCard, EmptyState, PageShell, SectionTitle } from "@/components/admin";
import { ProfilePhoto } from "@/components/profile-photo";
import { Avatar, buttonClass, cx, StatusBadge } from "@/components/ui";
import { getInvoices, getQuotes, getSettings } from "@/lib/data";
import { formatDateLong, formatDateShort, formatRelative, invoiceNumber } from "@/lib/format";
import { formatUSD } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default async function AdminHome() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [settings, invoices, proposals, openQuotes, payments] = await Promise.all([
    getSettings(),
    getInvoices(),
    getQuotes({ source: "PUBLIC", seenAt: null }),
    getQuotes({ status: { in: ["DRAFT", "SENT"] } }),
    prisma.payment.findMany({ where: { paidAt: { gte: new Date(now.getTime() - 9 * WEEK) } } }),
  ]);

  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const collected = sum(payments.filter((p) => p.paidAt >= monthStart).map((p) => p.amount));
  const prevCollected = sum(payments.filter((p) => p.paidAt >= prevMonthStart && p.paidAt < monthStart).map((p) => p.amount));
  const change = prevCollected > 0 ? Math.round(((collected - prevCollected) / prevCollected) * 100) : null;
  const pendingInv = invoices.filter((i) => i.status === "SENT" || i.status === "PARTIAL");
  const overdueInv = invoices.filter((i) => i.status === "OVERDUE");
  const weeks = Array.from({ length: 6 }, (_, k) => {
    const end = now.getTime() - (5 - k) * WEEK;
    return sum(payments.filter((p) => p.paidAt.getTime() > end - WEEK && p.paidAt.getTime() <= end).map((p) => p.amount));
  });
  const maxWeek = Math.max(...weeks, 1);
  const monthName = new Intl.DateTimeFormat("es-DO", { month: "long" }).format(now);

  const metrics = [
    {
      label: "Por cobrar",
      value: formatUSD(sum(pendingInv.map((i) => i.pending))),
      detail: plural(pendingInv.length, "factura"),
      icon: Hourglass,
      tone: "bg-accent-soft text-accent-ink",
    },
    {
      label: "Vencido",
      value: formatUSD(sum(overdueInv.map((i) => i.pending))),
      detail: plural(overdueInv.length, "factura"),
      icon: CircleExclamationPoint,
      tone: "bg-[#FDEDED] text-[#C53030]",
    },
    {
      label: "Cotizaciones abiertas",
      value: String(openQuotes.length),
      detail: `${formatUSD(sum(openQuotes.map((q) => q.total)))} en total`,
      icon: FileText,
      tone: "bg-[#FFF8DD] text-[#9A7400]",
      desktopOnly: true,
    },
  ];

  return (
    <PageShell className="gap-[22px] lg:gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ProfilePhoto size={48} className="lg:hidden" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-[13px] text-muted">{formatDateLong(now)}</p>
            <h1 className="text-[28px] font-bold tracking-[-0.035em] sm:text-[30px] lg:text-[32px]">
              Hola, {settings.ownerName.split(" ")[0]}
            </h1>
          </div>
        </div>
        <Link href="/admin/cotizaciones/nueva" className={buttonClass("primary", "h-[46px] text-sm max-lg:hidden")}>
          <Plus size={18} /> Nueva cotización
        </Link>
        <nav className="flex shrink-0 gap-1.5 lg:hidden" aria-label="Más secciones">
          <Link
            href="/admin/catalogo"
            aria-label="Catálogo"
            className="grid size-10 place-items-center rounded-full bg-surface shadow-card"
          >
            <Layers size={20} />
          </Link>
          <Link
            href="/admin/ajustes"
            aria-label="Ajustes"
            className="grid size-10 place-items-center rounded-full bg-surface shadow-card"
          >
            <Settings size={20} />
          </Link>
        </nav>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-[380px_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4 rounded-[28px] bg-ink p-[22px] text-white col-span-2 lg:col-span-3 lg:rounded-3xl xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-nav-idle lg:text-[13px]">Cobrado en {monthName}</span>
            {change !== null && (
              <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-[#8DBBFF]">
                {change >= 0 ? "+" : ""}
                {change}% vs. mes pasado
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <span className="text-[38px] font-bold tracking-[-0.04em] tabular-nums lg:text-[34px]">{formatUSD(collected)}</span>
            <div className="flex h-14 items-end gap-2 lg:h-11 lg:gap-1.5" aria-label="Cobros de las últimas 6 semanas">
              {weeks.map((w, i) => (
                <span
                  key={i}
                  title={formatUSD(w)}
                  className={cx("w-full rounded-lg lg:w-3 lg:rounded", i === 5 ? "bg-accent" : "bg-[#2A2D33]")}
                  style={{ height: `${Math.max(14, (w / maxWeek) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cx("card flex-col gap-3 p-[18px] lg:p-[22px]", m.desktopOnly ? "hidden lg:flex" : "flex")}
          >
            <div className="flex items-center justify-between max-lg:order-2">
              <span className="text-[13px] text-muted max-lg:hidden">{m.label}</span>
              <span className={cx("grid size-9 place-items-center rounded-xl lg:size-8 lg:rounded-[10px]", m.tone)}>
                <m.icon size={18} />
              </span>
            </div>
            <div className="flex flex-col gap-0.5 max-lg:order-3">
              <span className="text-[13px] text-muted lg:hidden">{m.label}</span>
              <span className="text-xl font-bold tracking-[-0.02em] tabular-nums lg:text-[28px]">{m.value}</span>
              <span className="text-xs text-muted max-lg:hidden">{m.detail}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="card hidden flex-col px-[22px] py-5 lg:flex">
          <SectionTitle
            action={
              <Link href="/admin/facturas" className="text-[13px] font-medium text-accent-ink">
                Ver todas
              </Link>
            }
          >
            Facturas recientes
          </SectionTitle>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2.5 font-medium">Cliente</th>
                <th className="py-2.5 font-medium">Número</th>
                <th className="py-2.5 font-medium">Estado</th>
                <th className="py-2.5 font-medium">Vence</th>
                <th className="py-2.5 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 6).map((inv) => (
                <tr key={inv.id} className="border-b border-line last:border-0">
                  <td className="py-3">
                    <Link href={`/admin/facturas?id=${inv.id}`} className="flex items-center gap-3">
                      <Avatar name={inv.client.name} size={36} />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{inv.client.name}</span>
                        <span className="text-xs text-muted">{inv.title}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-[13px] text-ink-2">{invoiceNumber(inv.number)}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="text-[13px] text-ink-2">{inv.status === "DRAFT" ? "—" : formatDateShort(inv.dueAt)}</td>
                  <td className="text-right text-sm font-semibold tabular-nums">{formatUSD(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle
            action={
              <Link href="/admin/cotizaciones?origen=web" className="text-sm font-medium text-accent-ink lg:hidden">
                Ver todas
              </Link>
            }
          >
            <span className="flex items-center gap-2">
              Propuestas nuevas
              {proposals.length > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{proposals.length}</span>
              )}
            </span>
          </SectionTitle>
          {proposals.length === 0 ? (
            <EmptyState icon={Inbox} title="Sin propuestas nuevas">
              Cuando alguien use tu cotizador, aparece aquí.
            </EmptyState>
          ) : (
            proposals
              .slice(0, 4)
              .map((q) => (
                <DocCard
                  key={q.id}
                  href={`/admin/cotizaciones/${q.id}`}
                  icon={Inbox}
                  title={q.client.name}
                  subtitle={q.title}
                  amount={formatUSD(q.total)}
                  number="Desde el cotizador"
                  numberIcon={MessageCircle}
                  date={formatRelative(q.createdAt, now)}
                />
              ))
          )}
          <p className="hidden rounded-[22px] bg-accent-soft p-[18px] text-[13px] leading-relaxed text-accent-ink lg:block">
            Abre una propuesta para ajustar precios, enviarla como cotización o convertirla en factura.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
