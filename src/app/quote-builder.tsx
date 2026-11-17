"use client";

import { ArrowRight, Check, ChevronLeft, Info, MessageCircle, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { CatalogIcon } from "@/components/icon";
import { buttonClass, Chip, cx, inputClass, Toggle } from "@/components/ui";
import { ProfilePhoto } from "@/components/profile-photo";
import { type Currency, formatDOP, formatIn, formatRate, formatUSD } from "@/lib/money";
import { computeTotals } from "@/lib/totals";
import { businessNameError, personNameError, tidy } from "@/lib/validation";
import { fillTemplate, whatsappLink } from "@/lib/whatsapp";
import { submitProposal } from "./actions";

export type BuilderItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  unit: "ONCE" | "EACH" | "MONTHLY";
};

type Settings = {
  whatsapp: string;
  rate: number; // pesos per US$1, refreshed every 6 hours
  template: string;
  ownerName: string;
  ownerRole: string;
  portfolioUrl: string;
};

type Step = 1 | 2 | 3;

export function QuoteBuilder({
  projects,
  extras,
  settings,
}: {
  projects: BuilderItem[];
  extras: BuilderItem[];
  settings: Settings;
}) {
  const [step, setStep] = useState<Step>(1);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>("DOP");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; business?: boolean }>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId) ?? null;
  const chosenExtras = extras.filter((e) => (qty[e.id] ?? 0) > 0);
  const money = (n: number) => formatIn(currency, n, settings.rate);

  const totals = useMemo(
    () =>
      computeTotals(
        [
          ...(project ? [{ quantity: 1, unitPrice: project.price, unit: project.unit }] : []),
          ...chosenExtras.map((e) => ({ quantity: qty[e.id], unitPrice: e.price, unit: e.unit })),
        ],
        { urgent },
      ),
    [project, chosenExtras, qty, urgent],
  );

  const countable = chosenExtras.filter((e) => e.unit !== "MONTHLY").length;
  const totalLabel = countable ? `Total estimado · ${countable} ${countable === 1 ? "extra" : "extras"}` : "Total estimado";

  const message = useMemo(() => {
    const monthly = chosenExtras.filter((e) => e.unit === "MONTHLY");
    const extraLine = (e: BuilderItem) =>
      e.unit === "EACH" ? `${e.name} ×${qty[e.id]} — ${money(e.price * qty[e.id])}` : `${e.name} — ${money(e.price)}`;
    return fillTemplate(settings.template, {
      cliente: tidy(name) || "(tu nombre)",
      negocio: tidy(business),
      proyecto: project ? `${project.name} — ${money(project.price)}` : "",
      extras: chosenExtras.filter((e) => e.unit !== "MONTHLY").map(extraLine),
      plazo: urgent ? "Urgente (+20%)" : "Normal (3–4 semanas)",
      total:
        currency === "USD"
          ? `${formatUSD(totals.total)} (≈ ${formatDOP(totals.total, settings.rate)})`
          : `${formatDOP(totals.total, settings.rate)} (= ${formatUSD(totals.total)} · tasa ${formatRate(settings.rate)})`,
      mensual: monthly.map((e) => `🔧 ${e.name}: ${money(e.price)}/mes (aparte)`).join("\n"),
      nota: note,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- money() only depends on currency and rate
  }, [settings, name, business, project, chosenExtras, qty, urgent, totals.total, currency, note]);

  const link = whatsappLink(settings.whatsapp, message);
  const errors = { name: personNameError(name), business: businessNameError(business) };
  const formValid = !errors.name && !errors.business;
  const canSend = Boolean(project && formValid);
  const fieldError = (k: "name" | "business") => ((showErrors || touched[k]) && errors[k]) || null;

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setQuantity(id: string, value: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, value)) }));
  }

  async function onSend(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setSendError(null);
    if (!canSend || !project) {
      // Nothing is sent and WhatsApp does not open until every required field is valid.
      setShowErrors(true);
      if (!project) go(1);
      else {
        if (step !== 3) setStep(3);
        requestAnimationFrame(() => document.getElementById(errors.name ? "cliente-nombre" : "cliente-negocio")?.focus());
      }
      return;
    }
    if (sending) return;
    setSending(true);
    // Open the tab now (inside the click, so it is not blocked as a popup),
    // save the proposal, then send that tab to WhatsApp. If the tab could not
    // open (some phones), WhatsApp opens in this same tab after saving.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    let result: { ok: boolean; error?: string } | "timeout";
    try {
      result = await Promise.race([
        submitProposal({
          projectId: project.id,
          extras: chosenExtras.map((x) => ({ id: x.id, quantity: qty[x.id] })),
          name: tidy(name),
          business: tidy(business),
          urgent,
          note,
          website,
          currency,
        }),
        new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 6000)), // never keep the client waiting long
      ]);
    } catch {
      result = { ok: false, error: "No se pudo enviar. Revisa tu conexión e inténtalo otra vez." };
    } finally {
      setSending(false);
    }
    if (result !== "timeout" && !result.ok) {
      tab?.close();
      setShowErrors(true);
      setSendError(result.error ?? "Revisa los datos marcados en rojo.");
      return;
    }
    setSentMessage(message);
    window.scrollTo({ top: 0 });
    if (tab) tab.location.href = link;
    else window.location.href = link;
  }

  function reset() {
    setSentMessage(null);
    setProjectId(null);
    setQty({});
    setNote("");
    setUrgent(false);
    setShowErrors(false);
    go(1);
  }

  const summary = (
    <Summary
      project={project}
      extras={chosenExtras}
      qty={qty}
      totals={totals}
      urgent={urgent}
      currency={currency}
      rate={settings.rate}
      link={link}
      canSend={canSend}
      onSend={onSend}
      sending={sending}
      formError={sendError ?? (showErrors && !formValid ? "Completa los campos marcados con *." : null)}
    />
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[1440px]">
      <Header settings={settings} currency={currency} onCurrency={setCurrency} />

      {sentMessage ? (
        <Sent message={sentMessage} settings={settings} link={whatsappLink(settings.whatsapp, sentMessage)} onReset={reset} />
      ) : (
        <main className="px-5 pb-36 md:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 lg:pb-16 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8 xl:px-16">
          <div className="flex min-w-0 flex-col gap-8">
            {/* Hero */}
            <section className={cx("flex flex-col gap-2.5 pt-2", step !== 1 && "max-lg:hidden")}>
              <h1 className="text-[34px] leading-tight font-bold tracking-[-0.035em] lg:text-[44px] xl:text-[52px]">
                Cotiza tu proyecto
              </h1>
              <p className="max-w-xl text-[15px] leading-relaxed text-muted lg:text-base">
                Elige lo que necesitas y mira el precio al instante. Cuando termines, me llega por WhatsApp.
              </p>
            </section>

            {/* Step 1 · project type */}
            <section className={cx("flex flex-col gap-4", step !== 1 && "max-lg:hidden")}>
              <div className="flex flex-col gap-2.5 lg:hidden">
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold">Paso 1 de 3</span>
                  <span className="text-muted">Tipo de proyecto</span>
                </div>
                <Progress step={1} />
              </div>
              <SectionTitle n={1} title="¿Qué quieres crear?" mobileClass="text-[19px] tracking-[-0.015em]" />
              {showErrors && !project && (
                <p className="text-sm font-medium text-[#C53030]">Elige un tipo de proyecto para seguir.</p>
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {projects.map((p) => {
                  const selected = p.id === projectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setProjectId(selected ? null : p.id)}
                      className={cx(
                        "relative flex flex-col gap-3 rounded-[22px] border-2 bg-surface p-4 text-left shadow-card transition-colors",
                        selected ? "border-accent" : "border-transparent hover:border-accent/30",
                      )}
                    >
                      <span
                        className={cx(
                          "grid size-11 place-items-center rounded-[14px]",
                          selected ? "bg-accent-soft text-accent-ink" : "bg-bg text-ink",
                        )}
                      >
                        <CatalogIcon name={p.icon} size={22} strokeWidth={1.8} />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-semibold">{p.name}</span>
                        <span className="text-[13px] text-muted">desde {money(p.price)}</span>
                      </span>
                      {selected && (
                        <span className="absolute top-3.5 right-3.5 grid size-6 place-items-center rounded-full bg-accent text-white">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2 · extras */}
            <section className={cx("flex flex-col gap-4", step !== 2 && "max-lg:hidden")}>
              <MobileStepNav step={2} onBack={() => go(1)} />
              <SectionTitle n={2} title="Agrega extras" mobileTitle="Agrega extras" />
              {project && (
                <div className="flex w-fit max-w-full items-center gap-2.5 rounded-full bg-surface py-2 pr-2 pl-3 shadow-card lg:hidden">
                  <CatalogIcon name={project.icon} size={18} className="text-accent-ink" />
                  <span className="min-w-0 text-sm font-semibold">
                    {project.name} · {money(project.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="rounded-full bg-chip px-2.5 py-1 text-xs font-medium text-ink-2"
                  >
                    Cambiar
                  </button>
                </div>
              )}
              <div className="grid gap-2.5 md:grid-cols-2 lg:gap-3">
                {extras.map((e) => {
                  const q = qty[e.id] ?? 0;
                  const on = q > 0;
                  const priceText =
                    e.unit === "EACH"
                      ? `${money(e.price)} c/u${on ? ` · ${money(e.price * q)}` : ""}`
                      : e.unit === "MONTHLY"
                        ? `${money(e.price)}/mes · aparte`
                        : `+${money(e.price)}`;
                  const body = (
                    <>
                      <span
                        className={cx(
                          "grid size-11 shrink-0 place-items-center rounded-[14px]",
                          on ? "bg-accent-soft text-accent-ink" : "bg-bg text-ink-2",
                        )}
                      >
                        <CatalogIcon name={e.icon} size={22} strokeWidth={1.8} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-[15px] font-semibold break-words hyphens-auto">{e.name}</span>
                        <span className="text-[13px] text-muted">{priceText}</span>
                      </span>
                    </>
                  );
                  const rowClass = cx(
                    "flex items-center gap-3 rounded-[20px] border-[1.5px] bg-surface p-3.5 text-left shadow-card transition-colors sm:gap-3.5 sm:p-4",
                    on ? "border-accent" : "border-transparent",
                  );
                  return e.unit === "EACH" ? (
                    <div key={e.id} className={rowClass}>
                      {body}
                      <Stepper value={q} label={e.name} onChange={(v) => setQuantity(e.id, v)} />
                    </div>
                  ) : (
                    <div key={e.id} className={cx(rowClass, "cursor-pointer")} onClick={() => setQuantity(e.id, on ? 0 : 1)}>
                      {body}
                      <Toggle checked={on} label={e.name} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 3 · contact details */}
            <section className={cx("flex flex-col gap-5", step !== 3 && "max-lg:hidden")}>
              <MobileStepNav step={3} onBack={() => go(2)} />
              <SectionTitle n={3} title="Tus datos" mobileTitle="Tu propuesta" />
              <div className="card flex flex-col gap-3.5 p-[18px] lg:p-5">
                <div className="grid gap-3.5 md:grid-cols-2">
                  <TextField
                    id="cliente-nombre"
                    label="Tu nombre"
                    required
                    value={name}
                    onChange={setName}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    error={fieldError("name")}
                    placeholder="Ej.: Laura Méndez"
                    autoComplete="name"
                    maxLength={60}
                  />
                  <TextField
                    id="cliente-negocio"
                    label="Negocio"
                    required
                    value={business}
                    onChange={setBusiness}
                    onBlur={() => setTouched((t) => ({ ...t, business: true }))}
                    error={fieldError("business")}
                    placeholder="Ej.: Café Colonial"
                    autoComplete="organization"
                    maxLength={80}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">
                    Plazo <Req />
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={!urgent} onClick={() => setUrgent(false)} className="text-sm">
                      Normal
                    </Chip>
                    <Chip active={urgent} onClick={() => setUrgent(true)} className="text-sm">
                      Urgente +20%
                    </Chip>
                  </div>
                  <span className="text-xs text-muted">Normal: 3–4 semanas. Urgente: la mitad del tiempo.</span>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-2">Nota</span>
                  <textarea
                    className={cx(inputClass, "h-auto min-h-[84px] resize-y py-3 leading-snug")}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Cuéntame algo de tu proyecto"
                    maxLength={1000}
                  />
                </label>
                <input
                  tabIndex={-1}
                  aria-hidden
                  autoComplete="off"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="lg:hidden">{summary}</div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6">{summary}</div>
          </aside>
        </main>
      )}

      {/* Mobile bottom bar with the live total */}
      {!sentMessage && step < 3 && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-5 pb-6 md:px-10 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between rounded-full bg-ink py-2.5 pr-2.5 pl-6 shadow-float">
            <div className="flex flex-col">
              <span className="text-xs text-nav-idle">{totalLabel}</span>
              <span className="text-[21px] font-bold tracking-[-0.02em] text-white tabular-nums">{money(totals.total)}</span>
            </div>
            <button
              type="button"
              disabled={step === 1 && !project}
              onClick={() => go((step + 1) as Step)}
              className="flex h-[52px] items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              Siguiente <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({
  settings,
  currency,
  onCurrency,
}: {
  settings: Settings;
  currency: Currency;
  onCurrency: (c: Currency) => void;
}) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-4 md:px-10 lg:py-6 xl:px-16">
      <div className="flex items-center gap-2.5 lg:gap-3">
        <ProfilePhoto size={44} priority className="max-lg:size-10!" />
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold lg:text-base">{settings.ownerName}</span>
          <span className="text-xs text-muted lg:text-[13px]">{settings.ownerRole}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        {settings.portfolioUrl && (
          <a href={settings.portfolioUrl} className="hidden text-sm font-medium text-ink-2 hover:text-ink md:block">
            Ver mi portafolio
          </a>
        )}
        <div className="flex rounded-full bg-chip p-[3px]" role="group" aria-label="Moneda">
          {(
            [
              ["DOP", "RD$"],
              ["USD", "US$"],
            ] as const
          ).map(([c, label]) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => onCurrency(c)}
              className={cx(
                "rounded-full px-3 py-1.5 text-[13px] lg:px-3.5",
                currency === c ? "bg-surface font-semibold text-ink shadow-sm" : "font-medium text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function Progress({ step }: { step: Step }) {
  return (
    <div className="flex w-full gap-1.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cx("h-[5px] flex-1 rounded-full", i <= step ? "bg-accent" : "bg-[#DDE0E5]")} />
      ))}
    </div>
  );
}

function MobileStepNav({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between lg:hidden">
      <button
        type="button"
        onClick={onBack}
        aria-label="Atrás"
        className="grid size-10 place-items-center rounded-full bg-surface shadow-card"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="w-[120px]">
        <Progress step={step} />
      </div>
      <span className="text-[13px] font-semibold">Paso {step} de 3</span>
    </div>
  );
}

function SectionTitle({
  n,
  title,
  mobileTitle,
  mobileClass,
}: {
  n: number;
  title: string;
  mobileTitle?: string;
  mobileClass?: string;
}) {
  return (
    <>
      <h2 className={cx("font-bold lg:hidden", mobileTitle ? "text-[34px] leading-tight tracking-[-0.035em]" : mobileClass)}>
        {mobileTitle ?? title}
      </h2>
      <h2 className="hidden items-center gap-2.5 text-xl font-bold tracking-[-0.015em] lg:flex">
        <span className="grid size-[26px] place-items-center rounded-full bg-ink text-xs text-white">{n}</span>
        {title}
      </h2>
    </>
  );
}

function Stepper({ value, label, onChange }: { value: number; label: string; onChange: (v: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full bg-bg p-1">
      <button
        type="button"
        aria-label={`Quitar ${label}`}
        disabled={value === 0}
        onClick={() => onChange(value - 1)}
        className="grid size-7 place-items-center rounded-full bg-surface disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <span className="w-3 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Agregar ${label}`}
        onClick={() => onChange(value + 1)}
        className="grid size-7 place-items-center rounded-full bg-accent text-white"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function Summary({
  project,
  extras,
  qty,
  totals,
  urgent,
  currency,
  rate,
  link,
  canSend,
  onSend,
  sending,
  formError,
}: {
  project: BuilderItem | null;
  extras: BuilderItem[];
  qty: Record<string, number>;
  totals: ReturnType<typeof computeTotals>;
  urgent: boolean;
  currency: Currency;
  rate: number;
  link: string;
  canSend: boolean;
  onSend: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  sending: boolean;
  formError: string | null;
}) {
  const money = (n: number) => formatIn(currency, n, rate);
  const other = currency === "DOP" ? formatUSD(totals.total) : formatDOP(totals.total, rate);
  const monthly = extras.filter((e) => e.unit === "MONTHLY");
  return (
    <div className="flex flex-col gap-5">
      <div className="card flex flex-col gap-3 p-[18px] lg:gap-4 lg:rounded-[28px] lg:p-6">
        <h3 className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.015em]">
          <span className="lg:hidden">Resumen</span>
          <span className="max-lg:hidden">Tu cotización</span>
        </h3>
        {!project && <p className="text-sm text-muted">Elige un tipo de proyecto para empezar.</p>}
        {project && <Line label={project.name} value={money(project.price)} strong />}
        {extras
          .filter((e) => e.unit !== "MONTHLY")
          .map((e) => (
            <Line key={e.id} label={e.unit === "EACH" ? `${e.name} ×${qty[e.id]}` : e.name} value={money(e.price * qty[e.id])} />
          ))}
        {urgent && totals.urgentFee > 0 && <Line label="Plazo urgente (+20%)" value={money(totals.urgentFee)} />}
        <hr className="border-line" />
        <div className="flex items-end justify-between gap-3 lg:flex-col lg:items-start lg:gap-1">
          <div className="flex flex-col gap-0.5 lg:contents">
            <span className="text-sm font-semibold lg:order-1 lg:text-[13px] lg:font-normal lg:text-muted">Total estimado</span>
            <span className="text-xs text-muted lg:order-3 lg:text-[13px]">
              {currency === "DOP" ? "=" : "≈"} {other} · US$1 = RD${formatRate(rate)}
              {monthly.length > 0 && <span className="max-lg:hidden"> · Mantenimiento aparte</span>}
            </span>
          </div>
          <span className="text-[26px] font-bold tracking-[-0.025em] tabular-nums lg:order-2 lg:text-[40px] lg:tracking-[-0.035em]">
            {money(totals.total)}
          </span>
        </div>
        {monthly.map((e) => (
          <Line key={e.id} label={`${e.name} (aparte)`} value={`${money(e.price)}/mes`} />
        ))}
        <div className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2.5 text-xs text-accent-ink lg:hidden">
          <Info size={16} className="shrink-0" />
          Precio de referencia. Te confirmo el final por WhatsApp.
        </div>
        <SendButton link={link} canSend={canSend} onSend={onSend} sending={sending} className="max-lg:hidden" />
        {formError && (
          <p role="alert" className="text-center text-sm font-medium text-[#C53030] max-lg:hidden">
            {formError}
          </p>
        )}
        <p className="text-center text-xs text-muted max-lg:hidden">Precio de referencia. Te confirmo el final por WhatsApp.</p>
      </div>
      <div className="flex flex-col items-center gap-2.5 lg:hidden">
        <SendButton link={link} canSend={canSend} onSend={onSend} sending={sending} className="h-[58px] text-base" />
        {formError ? (
          <p role="alert" className="text-center text-sm font-medium text-[#C53030]">
            {formError}
          </p>
        ) : (
          <p className="text-xs text-muted">Se abrirá WhatsApp con el mensaje ya escrito.</p>
        )}
      </div>
    </div>
  );
}

function SendButton({
  link,
  canSend,
  onSend,
  sending,
  className,
}: {
  link: string;
  canSend: boolean;
  onSend: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  sending: boolean;
  className?: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onSend}
      aria-busy={sending}
      className={buttonClass("primary", cx("w-full", (!canSend || sending) && "opacity-60", className))}
    >
      <MessageCircle size={20} />
      {sending ? "Abriendo WhatsApp…" : "Enviar propuesta por WhatsApp"}
    </a>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className={strong ? "font-semibold" : "text-ink-2"}>{label}</span>
      <span className={cx("tabular-nums", strong ? "font-semibold" : "font-medium")}>{value}</span>
    </div>
  );
}

function Sent({ message, settings, link, onReset }: { message: string; settings: Settings; link: string; onReset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 pt-6 pb-10">
      <span className="grid size-[76px] place-items-center rounded-full bg-accent text-white shadow-fab">
        <Check size={36} strokeWidth={2.5} />
      </span>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[30px] font-bold tracking-[-0.035em]">¡Propuesta lista!</h1>
        <p className="max-w-[300px] text-[15px] leading-relaxed text-muted">
          Abrimos WhatsApp con este mensaje. Solo toca enviar y te respondo pronto.
        </p>
      </div>
      <div className="card w-full overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <ProfilePhoto size={34} />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{settings.ownerName}</span>
            <span className="text-[11px] text-muted">WhatsApp</span>
          </span>
        </div>
        <div className="flex justify-end bg-[#EFEAE2] p-3.5">
          <p className="max-w-[300px] rounded-2xl rounded-br-sm bg-[#D9FDD3] px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-line text-[#111B21]">
            {message}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <a href={link} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "w-full")}>
          <MessageCircle size={20} /> Abrir WhatsApp otra vez
        </a>
        <button type="button" onClick={onReset} className={buttonClass("soft", "w-full")}>
          Hacer otra cotización
        </button>
      </div>
    </main>
  );
}

/** Red asterisk for required fields. */
function Req() {
  return (
    <span aria-hidden className="text-[#C53030]">
      *
    </span>
  );
}

function TextField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  ...input
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error: string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur" | "id">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
        {label} {required && <Req />}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(inputClass, error && "bg-[#FDF3F3] ring-2 ring-[#F5C6C6]")}
        {...input}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs font-medium text-[#C53030]">
          {error}
        </span>
      )}
    </div>
  );
}
