"use client";

import { Check, ChevronLeft, Copy, MessageCircle, Plus, ReceiptText, Trash, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { Req } from "@/components/form";
import { CatalogIcon } from "@/components/icon";
import { buttonClass, cx, inputClass, StatusBadge, Toggle } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { MoneyInput } from "@/components/money-input";
import { formatDOP, formatUSD } from "@/lib/money";
import { computeTotals, type DocStatus } from "@/lib/totals";
import { phoneError } from "@/lib/validation";
import { whatsappLink } from "@/lib/whatsapp";
import { convertQuoteToInvoice, deleteQuote, duplicateQuote, saveInvoice, saveQuote } from "../actions";

type Unit = "ONCE" | "EACH" | "MONTHLY";
export type EditorLine = {
  key: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  unitPrice: number;
  unit: Unit;
};
export type EditorClient = { id: string; name: string; contact: string; phone: string };
export type EditorCatalogItem = {
  id: string;
  kind: "PROJECT" | "EXTRA";
  name: string;
  description: string;
  icon: string;
  price: number;
  unit: Unit;
};

type QuoteFields = { status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED"; urgent: boolean; validUntil: string | null };
type InvoiceFields = { sent: boolean; issuedAt: string; dueAt: string };

export type EditorProps = {
  id: string | null;
  number: string | null; // "COT-0045"
  clients: EditorClient[];
  catalog: EditorCatalogItem[];
  rate: number; // pesos per US$1, for the RD$ equivalent
  initial: {
    clientId: string | null;
    title: string;
    discountPct: number;
    applyTax: boolean;
    notes: string;
    items: EditorLine[];
  };
  fromPublic?: boolean;
  invoiceId?: string | null; // quote already converted
  displayStatus?: DocStatus; // invoices: derived status
} & ({ kind: "quote"; quote: QuoteFields } | { kind: "invoice"; invoice: InvoiceFields });

const QUOTE_STATUS: { value: QuoteFields["status"]; label: string }[] = [
  { value: "DRAFT", label: "Borrador" },
  { value: "SENT", label: "Enviada" },
  { value: "ACCEPTED", label: "Aceptada" },
  { value: "REJECTED", label: "Rechazada" },
];

let seq = 0;
const newKey = () => `n${++seq}`;
const digits = (s: string) => Number(s.replace(/[^\d]/g, "") || 0);

export function DocEditor(props: EditorProps) {
  const router = useRouter();
  const isQuote = props.kind === "quote";
  const [clientId, setClientId] = useState<string>(props.initial.clientId ?? (props.clients.length ? "" : "new"));
  const [newClient, setNewClient] = useState({ name: "", phone: "" });
  const [title, setTitle] = useState(props.initial.title);
  const [items, setItems] = useState<EditorLine[]>(props.initial.items);
  const [discountPct, setDiscountPct] = useState(props.initial.discountPct);
  const [applyTax, setApplyTax] = useState(props.initial.applyTax);
  const [notes, setNotes] = useState(props.initial.notes);
  const [quote, setQuote] = useState<QuoteFields>(isQuote ? props.quote : { status: "DRAFT", urgent: false, validUntil: null });
  const [invoice, setInvoice] = useState<InvoiceFields>(
    props.kind === "invoice" ? props.invoice : { sent: false, issuedAt: "", dueAt: "" },
  );
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const client = props.clients.find((c) => c.id === clientId);
  const totals = useMemo(
    () => computeTotals(items, { discountPct, applyTax, urgent: isQuote && quote.urgent }),
    [items, discountPct, applyTax, isQuote, quote.urgent],
  );
  const statusForBadge: DocStatus = isQuote ? quote.status : (props.displayStatus ?? (invoice.sent ? "SENT" : "DRAFT"));

  const message = useMemo(() => {
    const who = client?.contact || client?.name || newClient.name || "";
    const lines = items
      .filter((i) => i.name.trim())
      .map((i) =>
        i.unit === "MONTHLY"
          ? `• ${i.name} — ${formatUSD(i.unitPrice)}/mes (aparte)`
          : `• ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""} — ${formatUSD(i.quantity * i.unitPrice)}`,
      );
    const what = isQuote
      ? `la cotización${props.number ? ` ${props.number}` : ""}`
      : `la factura${props.number ? ` ${props.number}` : ""}`;
    return [
      `Hola${who ? ` ${who}` : ""} 👋 Te comparto ${what}${title ? ` (${title})` : ""}:`,
      "",
      ...lines,
      "",
      totals.urgentFee ? `Plazo urgente (+20%): ${formatUSD(totals.urgentFee)}` : "",
      totals.discount ? `Descuento ${discountPct}%: −${formatUSD(totals.discount)}` : "",
      totals.tax ? `ITBIS 18%: ${formatUSD(totals.tax)}` : "",
      `Total: ${formatUSD(totals.total)} (≈ ${formatDOP(totals.total, props.rate)})` +
        (isQuote && quote.validUntil ? ` · válida hasta el ${formatDate(new Date(`${quote.validUntil}T12:00:00`))}` : "") +
        (!isQuote && invoice.dueAt ? ` · vence el ${formatDate(new Date(`${invoice.dueAt}T12:00:00`))}` : ""),
    ]
      .filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i > 0))
      .join("\n")
      .trim();
  }, [
    client,
    newClient.name,
    items,
    isQuote,
    props.number,
    props.rate,
    title,
    totals,
    discountPct,
    quote.validUntil,
    invoice.dueAt,
  ]);

  const phone = client?.phone || newClient.phone;
  const phoneProblem = phone ? phoneError(phone) : "Agrega el WhatsApp del cliente para poder enviarlo.";
  const waLink = phone && !phoneProblem ? whatsappLink(phone, message) : null;

  function update(key: string, patch: Partial<EditorLine>) {
    setItems((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addFromCatalog(c: EditorCatalogItem) {
    setItems((ls) => [
      ...ls,
      { key: newKey(), name: c.name, description: c.description, icon: c.icon, quantity: 1, unitPrice: c.price, unit: c.unit },
    ]);
    if (!title) setTitle(c.name);
    setPicker(false);
  }

  function payload() {
    const base = {
      client: clientId === "new" || !clientId ? { newName: newClient.name, phone: newClient.phone } : { id: clientId },
      title,
      discountPct,
      applyTax,
      notes,
      items: items.map(({ name, description, icon, quantity, unitPrice, unit }) => ({
        name,
        description,
        icon,
        quantity,
        unitPrice,
        unit,
      })),
    };
    return base;
  }

  function save(opts: { markSent?: boolean } = {}) {
    setError(null);
    start(async () => {
      const res = isQuote
        ? await saveQuote(props.id, {
            ...payload(),
            ...quote,
            status: opts.markSent && quote.status === "DRAFT" ? "SENT" : quote.status,
          })
        : await saveInvoice(props.id, { ...payload(), ...invoice, sent: opts.markSent ? true : invoice.sent });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (opts.markSent) {
        if (isQuote && quote.status === "DRAFT") setQuote((q) => ({ ...q, status: "SENT" }));
        if (!isQuote) setInvoice((v) => ({ ...v, sent: true }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      const base = isQuote ? "/admin/cotizaciones" : "/admin/facturas";
      if (!props.id) router.replace(`${base}/${res.id}${isQuote ? "" : "/editar"}`);
      else router.refresh();
    });
  }

  const backHref = isQuote ? "/admin/cotizaciones" : props.id ? `/admin/facturas/${props.id}` : "/admin/facturas";
  const heading = props.number ?? (isQuote ? "Nueva cotización" : "Nueva factura");

  return (
    <main className="mx-auto flex w-full max-w-[1300px] flex-col gap-5 px-5 pt-5 pb-8 md:px-8 lg:px-10 lg:pt-8">
      {/* Header */}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <Link
            href={backHref}
            aria-label="Atrás"
            className="grid size-10 place-items-center rounded-full bg-surface shadow-card"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col items-center gap-0.5 lg:items-start">
            <span className="hidden text-[13px] text-muted lg:block">{isQuote ? "Cotizaciones" : "Facturas"}</span>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold lg:text-[30px] lg:tracking-[-0.03em]">{heading}</h1>
              <StatusBadge status={statusForBadge} className="max-lg:hidden" />
            </div>
            {props.fromPublic && <span className="text-xs text-muted lg:hidden">Creada desde el cotizador</span>}
          </div>
          <span className="size-10 lg:hidden" />
        </div>
        <div className="hidden flex-wrap items-center justify-end gap-2.5 xl:flex">{renderActions()}</div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Client + meta */}
          <section className="card flex flex-col gap-3.5 p-[18px]">
            <div className="grid gap-3.5 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">
                  Cliente <Req />
                </span>
                <select
                  aria-label="Cliente"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Elige un cliente…
                  </option>
                  {props.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.contact ? ` · ${c.contact}` : ""}
                    </option>
                  ))}
                  <option value="new">+ Cliente nuevo</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">
                  Proyecto <Req />
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej.: Página web + reservas"
                  className={inputClass}
                  maxLength={120}
                />
              </label>
            </div>
            {clientId === "new" && (
              <div className="grid gap-3.5 rounded-2xl bg-accent-soft/60 p-3.5 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">
                    Nombre del cliente o negocio <Req />
                  </span>
                  <input
                    value={newClient.name}
                    onChange={(e) => setNewClient((n) => ({ ...n, name: e.target.value }))}
                    className={cx(inputClass, "bg-white")}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">WhatsApp</span>
                  <input
                    value={newClient.phone}
                    onChange={(e) => setNewClient((n) => ({ ...n, phone: e.target.value }))}
                    inputMode="tel"
                    placeholder="809-555-0000"
                    className={cx(inputClass, "bg-white")}
                  />
                </label>
              </div>
            )}
            {client && (
              <p className="text-[13px] text-muted">
                {[client.contact, client.phone].filter(Boolean).join(" · ") || "Sin teléfono"} ·{" "}
                <Link href={`/admin/clientes/${client.id}`} className="font-medium text-accent-ink">
                  Ver ficha
                </Link>
              </p>
            )}

            {isQuote ? (
              <div className="flex flex-col gap-3.5 md:flex-row md:flex-wrap md:items-end">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">Estado</span>
                  <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                    {QUOTE_STATUS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        aria-pressed={quote.status === s.value}
                        onClick={() => setQuote((q) => ({ ...q, status: s.value }))}
                        className={cx(
                          "h-10 shrink-0 rounded-full px-4 text-sm",
                          quote.status === s.value ? "bg-accent font-medium text-white" : "bg-chip text-[#6B7079]",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex flex-col gap-1.5 md:w-44">
                  <span className="text-[13px] font-semibold text-ink-2">Válida hasta</span>
                  <input
                    type="date"
                    value={quote.validUntil ?? ""}
                    onChange={(e) => setQuote((q) => ({ ...q, validUntil: e.target.value || null }))}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-3.5 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">Emitida</span>
                  <input
                    type="date"
                    value={invoice.issuedAt}
                    onChange={(e) => setInvoice((v) => ({ ...v, issuedAt: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">Vence</span>
                  <input
                    type="date"
                    value={invoice.dueAt}
                    onChange={(e) => setInvoice((v) => ({ ...v, dueAt: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <div className="flex h-12 items-center gap-3">
                  <span className="text-sm text-ink-2">Enviada</span>
                  <Toggle
                    checked={invoice.sent}
                    onChange={(sent) => setInvoice((v) => ({ ...v, sent }))}
                    label="Factura enviada"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Items */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-bold tracking-[-0.015em]">Partidas</h2>
              <button
                type="button"
                onClick={() => setPicker((p) => !p)}
                aria-expanded={picker}
                className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-2 text-[13px] font-semibold text-accent-ink"
              >
                <Plus size={15} /> Del catálogo
              </button>
            </div>

            {picker && (
              <div className="card flex flex-col gap-1 p-2">
                <div className="flex items-center justify-between px-3 pt-2 pb-1">
                  <span className="text-sm font-semibold">Agregar del catálogo</span>
                  <button type="button" aria-label="Cerrar" onClick={() => setPicker(false)} className="text-muted">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid gap-1 md:grid-cols-2">
                  {props.catalog.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addFromCatalog(c)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-bg"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-bg text-ink-2">
                        <CatalogIcon name={c.icon} size={17} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold">{c.name}</span>
                        <span className="text-xs text-muted">{c.kind === "PROJECT" ? "Proyecto" : "Extra"}</span>
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {formatUSD(c.price)}
                        {c.unit === "MONTHLY" ? "/mes" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card flex flex-col px-[18px] py-1.5">
              {items.length === 0 && <p className="py-4 text-sm text-muted">Agrega partidas del catálogo o escribe una libre.</p>}
              {items.map((it) => (
                <div
                  key={it.key}
                  className="flex flex-col gap-2.5 border-b border-line py-3 md:flex-row md:items-center md:gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-bg text-ink-2">
                      <CatalogIcon name={it.icon} size={17} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <textarea
                        rows={1}
                        value={it.name}
                        onChange={(e) => update(it.key, { name: e.target.value.replace(/\n/g, " ") })}
                        aria-label="Concepto"
                        placeholder="Concepto"
                        className="w-full resize-none bg-transparent text-sm font-semibold outline-none [field-sizing:content] placeholder:text-muted"
                      />
                      <textarea
                        rows={1}
                        value={it.description}
                        onChange={(e) => update(it.key, { description: e.target.value.replace(/\n/g, " ") })}
                        aria-label="Detalle"
                        placeholder="Detalle (opcional)"
                        className="w-full resize-none bg-transparent text-xs text-muted outline-none [field-sizing:content]"
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums md:hidden">{formatUSD(it.quantity * it.unitPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={it.quantity}
                      onChange={(e) => update(it.key, { quantity: Math.max(1, digits(e.target.value)) })}
                      inputMode="numeric"
                      aria-label="Cantidad"
                      className="h-9 w-12 shrink-0 rounded-[10px] bg-bg text-center text-[13px] font-semibold outline-none"
                    />
                    <span className="text-xs text-muted">×</span>
                    <MoneyInput
                      label="Precio en US$"
                      value={it.unitPrice}
                      onChange={(unitPrice) => update(it.key, { unitPrice })}
                      className="h-9 min-w-0 flex-1 rounded-[10px] bg-bg px-2.5 text-[13px] md:w-28 md:flex-none"
                      inputClassName="text-right"
                    />
                    <select
                      value={it.unit}
                      onChange={(e) => update(it.key, { unit: e.target.value as Unit })}
                      aria-label="Tipo de precio"
                      className="h-9 shrink-0 rounded-[10px] bg-bg px-1.5 text-xs text-ink-2 outline-none"
                    >
                      <option value="ONCE">Único</option>
                      <option value="EACH">C/u</option>
                      <option value="MONTHLY">/mes</option>
                    </select>
                    <span className="w-24 text-right text-sm font-semibold tabular-nums max-md:hidden">
                      {formatUSD(it.quantity * it.unitPrice)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar ${it.name}`}
                      onClick={() => setItems((ls) => ls.filter((l) => l.key !== it.key))}
                      className="grid size-8 place-items-center rounded-full text-[#B5B9C0] hover:bg-bg hover:text-[#C53030]"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setItems((ls) => [
                    ...ls,
                    { key: newKey(), name: "", description: "", icon: "circle", quantity: 1, unitPrice: 0, unit: "ONCE" },
                  ])
                }
                className="flex items-center gap-2.5 py-3.5 text-sm text-muted hover:text-ink"
              >
                <Plus size={16} /> Partida libre
              </button>
            </div>
          </section>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Notas</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lo que pidió el cliente, condiciones, forma de pago…"
              className={cx(inputClass, "h-auto min-h-[84px] resize-y bg-surface py-3 leading-snug shadow-card")}
              maxLength={2000}
            />
          </label>
        </div>

        {/* Totals + preview */}
        <div className="flex flex-col gap-5">
          <section className="card flex flex-col gap-3.5 p-[22px]">
            <Row label="Subtotal" value={formatUSD(totals.subtotal)} />
            {isQuote && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-2">Plazo urgente (+20%)</span>
                <Toggle checked={quote.urgent} onChange={(urgent) => setQuote((q) => ({ ...q, urgent }))} label="Plazo urgente" />
              </div>
            )}
            {totals.urgentFee > 0 && <Row label="Recargo urgente" value={formatUSD(totals.urgentFee)} />}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Descuento</span>
              <span className="flex items-center gap-2">
                {totals.discount > 0 && <span className="text-sm font-medium text-[#1E8A4C]">−{formatUSD(totals.discount)}</span>}
                <span className="flex h-9 w-16 items-center rounded-[10px] bg-bg px-2 text-[13px]">
                  <input
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Math.min(100, digits(e.target.value)))}
                    inputMode="numeric"
                    aria-label="Descuento en porcentaje"
                    className="w-full bg-transparent text-right outline-none"
                  />
                  <span className="text-muted">%</span>
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">ITBIS 18%</span>
              <span className="flex items-center gap-2">
                {totals.tax > 0 && <span className="text-sm font-medium">{formatUSD(totals.tax)}</span>}
                <Toggle checked={applyTax} onChange={setApplyTax} label="Aplicar ITBIS" />
              </span>
            </div>
            <hr className="border-line" />
            <div className="flex items-end justify-between">
              <span className="font-bold">Total</span>
              <span className="text-[26px] font-bold tracking-[-0.03em] tabular-nums lg:text-[30px]">
                {formatUSD(totals.total)}
              </span>
            </div>
            <span className="-mt-2 text-right text-xs text-muted">≈ {formatDOP(totals.total, props.rate)}</span>
            {totals.monthly > 0 && <Row label="Mensual (aparte)" value={`${formatUSD(totals.monthly)}/mes`} />}
          </section>

          <section className="flex flex-col gap-2.5 rounded-3xl bg-[#EFEAE2] p-[18px]">
            <span className="text-[13px] font-semibold text-[#54656F]">Vista previa del mensaje</span>
            <p className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 text-xs leading-relaxed whitespace-pre-line text-[#111B21]">
              {message}
            </p>
            {phoneProblem && (
              <span className="text-xs font-medium text-[#8A2323]">
                {phone ? `WhatsApp no válido: ${phoneProblem}` : phoneProblem}
              </span>
            )}
          </section>

          {error && (
            <p role="alert" className="rounded-2xl bg-[#FDEDED] px-4 py-3 text-sm font-medium text-[#C53030]">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2.5 xl:hidden">{renderActions()}</div>
        </div>
      </div>
    </main>
  );

  function renderActions() {
    return (
      <>
        <div className="flex gap-2.5 max-lg:w-full">
          <button
            type="button"
            disabled={pending}
            onClick={() => save()}
            className={buttonClass("soft", "flex-1 lg:h-[46px] lg:text-sm")}
          >
            {saved ? <Check size={18} /> : null}
            {pending ? "Guardando…" : saved ? "Guardado" : "Guardar"}
          </button>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => save({ markSent: true })}
              className={buttonClass("primary", "flex-1 lg:h-[46px] lg:text-sm")}
            >
              <MessageCircle size={18} /> Enviar<span className="max-lg:hidden"> por WhatsApp</span>
            </a>
          ) : (
            <button type="button" disabled className={buttonClass("primary", "flex-1 lg:h-[46px] lg:text-sm")}>
              <MessageCircle size={18} /> Enviar
            </button>
          )}
        </div>
        {isQuote &&
          props.id &&
          (props.invoiceId ? (
            <Link
              href={`/admin/facturas/${props.invoiceId}`}
              className={buttonClass("outline", "max-lg:w-full lg:h-[46px] lg:text-sm")}
            >
              <ReceiptText size={18} /> Ver factura
            </Link>
          ) : (
            <form action={convertQuoteToInvoice.bind(null, props.id)} className="max-lg:w-full">
              <button className={buttonClass("outline", "w-full lg:h-[46px] lg:text-sm")}>
                <ReceiptText size={18} /> Convertir en factura
              </button>
            </form>
          ))}
        {isQuote && props.id && (
          <form action={duplicateQuote.bind(null, props.id)} className="max-lg:w-full">
            <button className={buttonClass("soft", "w-full lg:h-[46px] lg:px-4 lg:text-sm")}>
              <Copy size={17} /> Duplicar
            </button>
          </form>
        )}
        {isQuote && props.id && (
          <ConfirmButton
            question="¿Borrar esta cotización?"
            onConfirm={() => deleteQuote(props.id!)}
            className="py-2 text-sm font-medium text-[#C53030] hover:underline lg:px-2"
          >
            Borrar
          </ConfirmButton>
        )}
      </>
    );
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-2">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
