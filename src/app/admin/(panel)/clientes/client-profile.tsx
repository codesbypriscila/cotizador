import { FileText, MessageCircle, Phone, ReceiptText } from "lucide-react";
import Link from "next/link";
import { cx, StatusBadge } from "@/components/ui";
import { getInvoices, getQuotes } from "@/lib/data";
import { formatDateShort, invoiceNumber, quoteNumber } from "@/lib/format";
import { formatUSD } from "@/lib/money";
import { mailFrom } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { phoneError } from "@/lib/validation";
import { phoneForWhatsApp } from "@/lib/whatsapp";
import { EmailComposer } from "./email-composer";
import type { ClientWithBalance } from "./client-data";

/** Profile header, quick actions, totals, history and note. Used by the side panel and the client page. */
export async function ClientProfile({ client: c, layout }: { client: ClientWithBalance; layout: "panel" | "page" }) {
  const [quotes, invoices] = await Promise.all([getQuotes({ clientId: c.id }), getInvoices({ clientId: c.id })]);
  const history = [
    ...invoices.map((i) => ({
      id: i.id,
      href: `/admin/facturas/${i.id}`,
      kind: "Factura",
      number: invoiceNumber(i.number),
      title: i.title,
      total: i.total,
      status: i.status,
      date: i.issuedAt,
      icon: ReceiptText,
    })),
    ...quotes.map((q) => ({
      id: q.id,
      href: `/admin/cotizaciones/${q.id}`,
      kind: "Cotización",
      number: quoteNumber(q.number),
      title: q.title,
      total: q.total,
      status: q.status,
      date: q.createdAt,
      icon: FileText,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const settings = await prisma.settings.findUnique({ where: { id: 1 }, select: { ownerName: true, ownerRole: true } });
  // WhatsApp opens the client's own chat; only with a valid number.
  const validPhone = c.phone && !phoneError(c.phone);
  const actions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: validPhone ? `https://wa.me/${phoneForWhatsApp(c.phone)}` : null,
      primary: true,
    },
    { label: "Llamar", icon: Phone, href: validPhone ? `tel:+${phoneForWhatsApp(c.phone)}` : null },
  ];
  const page = layout === "page";

  return (
    <div className="flex flex-col gap-4">
      <div className={cx("flex items-center gap-3.5", page && "flex-col text-center")}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={cx("font-bold break-words", page ? "text-[26px] tracking-[-0.03em]" : "text-xl")}>{c.name}</span>
          <span className="text-[13px] text-muted">
            {[c.contact, c.phone].filter(Boolean).join(" · ") || "Sin datos de contacto"}
          </span>
        </div>
      </div>
      <div className={cx("flex flex-wrap gap-2", page && "justify-center")}>
        {actions.map((a) =>
          a.href ? (
            <a
              key={a.label}
              href={a.href}
              target={a.label === "WhatsApp" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={a.label}
              className={cx(
                "flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold",
                a.primary
                  ? "flex-1 bg-accent px-4 text-white"
                  : page
                    ? "bg-surface px-4 shadow-card"
                    : "w-10 bg-bg xl:w-auto xl:flex-1 xl:px-3",
                page && a.primary && "flex-none",
              )}
            >
              <a.icon size={15} />
              <span className={cx(!a.primary && !page && "max-xl:hidden")}>{a.label}</span>
            </a>
          ) : null,
        )}
        <EmailComposer
          clientId={c.id}
          clientEmail={c.email}
          greetingName={c.contact || c.name}
          from={mailFrom()}
          signature={[settings?.ownerName, settings?.ownerRole].filter(Boolean).join("\n")}
          compact={!page}
        />
      </div>
      {!validPhone && (
        <p className="text-xs text-muted">
          {c.phone
            ? "El WhatsApp guardado no es válido: corrígelo en los datos del cliente."
            : "Agrega su WhatsApp para escribirle o llamarle."}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Facturado", formatUSD(c.billed), ""],
          ["Cobrado", formatUSD(c.paid), "text-[#1E8A4C]"],
          ["Pendiente", formatUSD(c.pending), "text-accent-ink"],
        ].map(([l, v, tone]) => (
          <div
            key={l}
            className={cx(
              "flex min-w-0 flex-1 flex-col gap-0.5 rounded-[14px] px-3 py-2.5",
              page ? "bg-surface shadow-card" : "bg-bg",
            )}
          >
            <span className="text-[11px] text-muted">{l}</span>
            <span className={cx("text-sm font-bold break-all tabular-nums", tone)}>{v}</span>
          </div>
        ))}
      </div>

      <h3 className={cx("pt-1 font-bold", page ? "text-[19px] tracking-[-0.015em]" : "text-[15px]")}>Historial</h3>
      {history.length === 0 && <p className="text-sm text-muted">Sin cotizaciones ni facturas todavía.</p>}
      <div className={cx("flex flex-col", page ? "card px-[18px] py-1" : "gap-1")}>
        {history.map((h) => (
          <Link
            key={h.id}
            href={h.href}
            className={cx("flex items-center gap-3 py-2.5", page && "border-b border-line last:border-0")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bg text-ink-2">
              <h.icon size={17} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[13px] font-semibold">
                {h.number} · {formatDateShort(h.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <StatusBadge status={h.status} />
                <span className="truncate text-xs text-muted">{h.title}</span>
              </span>
            </span>
            <span className="text-[13px] font-semibold tabular-nums">{formatUSD(h.total)}</span>
          </Link>
        ))}
      </div>
      {c.notes && (
        <div className="flex flex-col gap-1.5 rounded-2xl bg-[#FFF8DD] p-3.5">
          <span className="text-xs font-semibold text-[#9A7400]">Nota interna</span>
          <p className="text-[13px] leading-relaxed whitespace-pre-line text-[#5E4A00]">{c.notes}</p>
        </div>
      )}
    </div>
  );
}
