"use client";

import { ArrowRight, Check, ChevronLeft, Info, Minus, Plus, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { ProfilePhoto } from "@/components/profile-photo";
import { buttonClass, Chip, cx, inputClass, Toggle } from "@/components/ui";
import { extraPrice } from "@/lib/catalog";
import { type Currency, formatDOP, formatIn, formatRate, formatUSD } from "@/lib/money";
import { computeTotals } from "@/lib/totals";
import { businessNameError, emailError, personNameError, phoneError, tidy } from "@/lib/validation";
import { submitProposal } from "./actions";

export type BuilderItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  unit: "ONCE" | "EACH" | "MONTHLY";
  required: boolean; // extras always included, the client cannot remove them
  maintenancePrice: number | null; // projects: monthly maintenance for this project type
};

type Settings = {
  rate: number; // pesos per US$1, refreshed every 6 hours
  ownerName: string;
  ownerRole: string;
  portfolioUrl: string;
};

type Step = 1 | 2 | 3;
type FieldKey = "name" | "business" | "email" | "phone";

const STEPS: { n: Step; title: string; short: string }[] = [
  { n: 1, title: "¿Qué quieres crear?", short: "Proyecto" },
  { n: 2, title: "Agrega extras", short: "Extras" },
  { n: 3, title: "Tus datos", short: "Tus datos" },
];

const FIELD_ORDER: { key: FieldKey; id: string }[] = [
  { key: "name", id: "cliente-nombre" },
  { key: "business", id: "cliente-negocio" },
  { key: "email", id: "cliente-correo" },
  { key: "phone", id: "cliente-telefono" },
];

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
  const [currency, setCurrency] = useState<Currency>("DOP");
  const [projectId, setProjectId] = useState<string | null>(null);
  // Required extras (maintenance, hosting) start included and cannot go below 1.
  const requiredQty = () => Object.fromEntries(extras.filter((e) => e.required).map((e) => [e.id, 1]));
  const [qty, setQty] = useState<Record<string, number>>(requiredQty);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [modal, setModal] = useState<"confirm" | "sent" | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId) ?? null;
  const money = (n: number) => formatIn(currency, n, settings.rate);
  const priceOf = (e: BuilderItem) => extraPrice(e, project);
  const oneTimeExtras = extras.filter((e) => e.unit !== "MONTHLY");
  const monthlyExtras = extras.filter((e) => e.unit === "MONTHLY");
  const chosenExtras = extras.filter((e) => (qty[e.id] ?? 0) > 0);

  const totals = useMemo(
    () =>
      computeTotals(
        [
          ...(project ? [{ quantity: 1, unitPrice: project.price, unit: project.unit }] : []),
          ...chosenExtras.map((e) => ({ quantity: qty[e.id], unitPrice: extraPrice(e, project), unit: e.unit })),
        ],
        { urgent },
      ),
    [project, chosenExtras, qty, urgent],
  );

  /** What every project costs each month with the required services (maintenance + hosting). */
  const requiredMonthly = (p: BuilderItem) =>
    monthlyExtras.filter((e) => e.required).reduce((sum, e) => sum + extraPrice(e, p), 0);

  const countable = chosenExtras.filter((e) => e.unit !== "MONTHLY").length;
  const extrasLabel = countable ? `${countable} ${countable === 1 ? "extra" : "extras"}` : "";

  const errors: Record<FieldKey, string | null> = {
    name: personNameError(name),
    business: businessNameError(business),
    email: email.trim() ? emailError(email) : "Escribe tu correo.",
    phone: phoneError(phone, { required: true }),
  };
  const formValid = Object.values(errors).every((e) => !e);
  const canSend = Boolean(project && formValid);
  const fieldError = (k: FieldKey) => ((showErrors || touched[k]) && errors[k]) || null;
  const touch = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setQuantity(id: string, value: number) {
    const min = extras.find((e) => e.id === id)?.required ? 1 : 0;
    setQty((q) => ({ ...q, [id]: Math.max(min, Math.min(50, value)) }));
  }

  /** "Enviar cotización": checks the data, then asks before sending anything. */
  function onSend() {
    if (!canSend || !project) {
      setShowErrors(true);
      if (!project) go(1);
      else {
        if (step !== 3) setStep(3);
        const first = FIELD_ORDER.find((f) => errors[f.key]);
        requestAnimationFrame(() => first && document.getElementById(first.id)?.focus());
      }
      return;
    }
    setSendError(null);
    setModal("confirm");
  }

  /** "Sí, enviar": saves the quote as pending so it shows up in the admin. */
  async function confirmSend() {
    if (!project || sending) return;
    setSending(true);
    setSendError(null);
    let res: { ok: boolean; error?: string };
    try {
      res = await submitProposal({
        projectId: project.id,
        extras: chosenExtras.map((x) => ({ id: x.id, quantity: qty[x.id] })),
        name: tidy(name),
        business: tidy(business),
        email: email.trim(),
        phone: phone.trim(),
        urgent,
        note,
        website,
        currency,
      });
    } catch {
      res = { ok: false, error: "No se pudo enviar. Revisa tu conexión e inténtalo otra vez." };
    }
    setSending(false);
    if (res.ok) setModal("sent");
    else setSendError(res.error ?? "No se pudo enviar. Inténtalo otra vez.");
  }

  function reset() {
    setModal(null);
    setProjectId(null);
    setQty(requiredQty());
    setNote("");
    setUrgent(false);
    setShowErrors(false);
    setTouched({});
    go(1);
  }

  const stepDone = (n: Step) => (n === 1 ? Boolean(project) : n === 2 ? step > 2 : formValid);
  const stepValue = (n: Step) =>
    n === 1 ? (project?.name ?? "Sin elegir") : n === 2 ? extrasLabel || "Ninguno" : tidy(name) || "Nombre, correo y WhatsApp";

  const summary = (
    <Summary
      project={project}
      extras={chosenExtras}
      qty={qty}
      priceOf={priceOf}
      totals={totals}
      urgent={urgent}
      currency={currency}
      rate={settings.rate}
      canSend={canSend}
      onSend={onSend}
      formError={showErrors && !canSend ? (project ? "Completa los campos marcados con *." : "Elige un tipo de proyecto.") : null}
    />
  );

  return (
    <div className="min-h-dvh w-full">
      <Header settings={settings} currency={currency} onCurrency={setCurrency} />

      <main className="px-4 pb-32 md:px-8 lg:grid lg:grid-cols-[210px_minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:pb-12 xl:grid-cols-[240px_minmax(0,1fr)_360px] xl:gap-10 xl:px-10">
        {/* Left: title and the three steps (computer) */}
        <aside className="hidden flex-col gap-6 lg:sticky lg:top-6 lg:flex">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.035em]">Cotiza tu proyecto</h1>
            <p className="text-sm leading-relaxed text-muted">Elige lo que necesitas y mira el precio al instante.</p>
          </div>
          <nav aria-label="Pasos" className="flex flex-col gap-1">
            {STEPS.map((s) => {
              const active = s.n === step;
              const done = s.n !== step && stepDone(s.n);
              return (
                <button
                  key={s.n}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  disabled={s.n > 1 && !project}
                  onClick={() => go(s.n)}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors disabled:opacity-50",
                    active ? "bg-surface shadow-card" : "hover:bg-surface/60",
                  )}
                >
                  <span
                    className={cx(
                      "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      active ? "bg-ink text-white" : done ? "bg-accent text-white" : "bg-chip text-muted",
                    )}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : s.n}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className={cx("text-sm", active ? "font-semibold" : "font-medium text-ink-2")}>{s.short}</span>
                    <span className="truncate text-xs text-muted">{stepValue(s.n)}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Middle: the current step */}
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          {step === 1 && (
            <section className="flex flex-col gap-1.5 lg:hidden">
              <h1 className="text-[26px] leading-tight font-bold tracking-[-0.035em]">Cotiza tu proyecto</h1>
              <p className="text-sm leading-relaxed text-muted">Elige lo que necesitas y mira el precio al instante.</p>
            </section>
          )}

          <MobileStepNav step={step} onBack={() => go((step - 1) as Step)} />
          <h2 className="text-lg font-bold tracking-[-0.015em] lg:text-xl">{STEPS[step - 1].title}</h2>

          {step === 1 && (
            <section className="flex flex-col gap-3">
              {showErrors && !project && (
                <p className="text-sm font-medium text-[#C53030]">Elige un tipo de proyecto para seguir.</p>
              )}
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
                {projects.map((p) => {
                  const selected = p.id === projectId;
                  const monthly = requiredMonthly(p);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setProjectId(selected ? null : p.id)}
                      className={cx(
                        "relative flex flex-col gap-1 rounded-[18px] border-2 bg-surface p-3.5 pr-8 text-left shadow-card transition-colors",
                        selected ? "border-accent" : "border-transparent hover:border-accent/30",
                      )}
                    >
                      <span className="text-sm leading-snug font-bold [overflow-wrap:anywhere]">{p.name}</span>
                      {p.description && <span className="text-xs leading-snug text-muted">{p.description}</span>}
                      <span className="mt-auto flex flex-col pt-1.5">
                        <span className="text-sm font-semibold">desde {money(p.price)}</span>
                        {monthly > 0 && <span className="text-[11px] text-muted">+ {money(monthly)}/mes</span>}
                      </span>
                      {selected && (
                        <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-accent text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="flex flex-col gap-3">
              {project && (
                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-surface py-1.5 pr-1.5 pl-3 shadow-card lg:hidden">
                  <span className="min-w-0 text-[13px] font-semibold">
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
              <ExtraList items={oneTimeExtras} qty={qty} priceOf={priceOf} money={money} onQuantity={setQuantity} />
              {monthlyExtras.length > 0 && (
                <>
                  <div className="flex flex-col gap-0.5 pt-2">
                    <h3 className="text-base font-bold tracking-[-0.01em]">Pagos mensuales</h3>
                    <p className="text-xs text-muted">Mantienen tu proyecto funcionando. Se pagan aparte, cada mes.</p>
                  </div>
                  <ExtraList items={monthlyExtras} qty={qty} priceOf={priceOf} money={money} onQuantity={setQuantity} />
                </>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="flex flex-col gap-4">
              <div className="card flex flex-col gap-3.5 rounded-[20px] p-4 lg:p-5">
                <div className="grid gap-3.5 md:grid-cols-2">
                  <TextField
                    id="cliente-nombre"
                    label="Tu nombre"
                    required
                    value={name}
                    onChange={setName}
                    onBlur={touch("name")}
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
                    onBlur={touch("business")}
                    error={fieldError("business")}
                    placeholder="Ej.: Café Colonial"
                    autoComplete="organization"
                    maxLength={80}
                  />
                  <TextField
                    id="cliente-correo"
                    label="Correo"
                    required
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={setEmail}
                    onBlur={touch("email")}
                    error={fieldError("email")}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    maxLength={120}
                  />
                  <TextField
                    id="cliente-telefono"
                    label="WhatsApp"
                    required
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={setPhone}
                    onBlur={touch("phone")}
                    error={fieldError("phone")}
                    placeholder="809 555 0123"
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-2">
                    Plazo <Req />
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={!urgent} onClick={() => setUrgent(false)}>
                      Normal
                    </Chip>
                    <Chip active={urgent} onClick={() => setUrgent(true)}>
                      Urgente +20%
                    </Chip>
                  </div>
                  <span className="text-xs text-muted">Normal: 3–4 semanas. Urgente: la mitad del tiempo.</span>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-2">Nota</span>
                  <textarea
                    className={cx(inputClass, "h-auto min-h-[76px] resize-y py-2.5 leading-snug")}
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
          )}

          {/* Computer: back / next under the step */}
          <div className="hidden items-center gap-2.5 lg:flex">
            {step > 1 && (
              <button type="button" onClick={() => go((step - 1) as Step)} className={buttonClass("soft", "h-11 px-5 text-sm")}>
                <ChevronLeft size={17} /> Atrás
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                disabled={step === 1 && !project}
                onClick={() => go((step + 1) as Step)}
                className={buttonClass("dark", "h-11 px-5 text-sm")}
              >
                Siguiente <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Right: the quote, always visible (computer) */}
        <aside className="hidden lg:sticky lg:top-6 lg:block">{summary}</aside>
      </main>

      {/* Phone and iPad: bottom bar with the live total */}
      {step < 3 && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-5 md:px-8 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between rounded-full bg-ink py-1.5 pr-1.5 pl-5 shadow-float">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] text-nav-idle">Total estimado{extrasLabel ? ` · ${extrasLabel}` : ""}</span>
              <span className="text-lg leading-tight font-bold tracking-[-0.02em] text-white tabular-nums">
                {money(totals.total)}
              </span>
            </div>
            <button
              type="button"
              disabled={step === 1 && !project}
              onClick={() => go((step + 1) as Step)}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              Siguiente <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {modal === "confirm" && (
        <Modal
          title="¿Enviar tu cotización?"
          onClose={() => setModal(null)}
          locked={sending}
          icon={
            <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent-ink">
              <Send size={22} />
            </span>
          }
        >
          <p className="text-center text-sm leading-relaxed text-ink-2">
            Vas a enviar tu información (nombre, negocio, correo y WhatsApp) junto con la cotización de{" "}
            <b>{money(totals.total)}</b>. Quedará en estado <b>pendiente</b> hasta que la revise.
          </p>
          {sendError && (
            <p role="alert" className="text-center text-sm font-medium text-[#C53030]">
              {sendError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={sending}
              className={buttonClass("soft", "h-11 px-3 text-sm")}
            >
              Cancelar
            </button>
            <button
              type="button"
              data-autofocus
              onClick={confirmSend}
              disabled={sending}
              aria-busy={sending}
              className={buttonClass("primary", "h-11 px-3 text-sm whitespace-nowrap")}
            >
              {sending ? "Enviando…" : "Sí, enviar"}
            </button>
          </div>
        </Modal>
      )}

      {modal === "sent" && (
        <Modal
          title="¡Información enviada!"
          onClose={reset}
          icon={
            <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
              <Check size={24} strokeWidth={2.5} />
            </span>
          }
        >
          <p className="text-center text-sm leading-relaxed text-ink-2">
            Tu cotización fue enviada y será revisada en un momento. Te escribo por WhatsApp al <b>{phone.trim()}</b>.
          </p>
          <button type="button" data-autofocus onClick={reset} className={buttonClass("primary", "h-11 w-full text-sm")}>
            Listo
          </button>
        </Modal>
      )}
    </div>
  );
}

function ExtraList({
  items,
  qty,
  priceOf,
  money,
  onQuantity,
}: {
  items: BuilderItem[];
  qty: Record<string, number>;
  priceOf: (e: BuilderItem) => number;
  money: (cents: number) => string;
  onQuantity: (id: string, value: number) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {items.map((e) => {
        const q = qty[e.id] ?? 0;
        const on = q > 0;
        const price = priceOf(e);
        const priceText =
          e.unit === "EACH"
            ? `${money(price)} c/u${on ? ` · ${money(price * q)}` : ""}`
            : e.unit === "MONTHLY"
              ? `${money(price)}/mes`
              : `+${money(price)}`;
        const body = (
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm leading-snug font-bold break-words hyphens-auto">{e.name}</span>
            {e.description && <span className="text-xs leading-snug text-muted">{e.description}</span>}
            <span className="text-xs font-semibold text-ink-2">{priceText}</span>
          </span>
        );
        const rowClass = cx(
          "flex items-center gap-3 rounded-[18px] border-[1.5px] bg-surface p-3 text-left shadow-card transition-colors",
          on ? "border-accent" : "border-transparent",
        );
        if (e.unit === "EACH")
          return (
            <div key={e.id} className={rowClass}>
              {body}
              <Stepper value={q} min={e.required ? 1 : 0} label={e.name} onChange={(v) => onQuantity(e.id, v)} />
            </div>
          );
        if (e.required)
          return (
            <div key={e.id} className={rowClass}>
              {body}
              <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">
                Incluido
              </span>
            </div>
          );
        return (
          <div key={e.id} className={cx(rowClass, "cursor-pointer")} onClick={() => onQuantity(e.id, on ? 0 : 1)}>
            {body}
            <Toggle checked={on} label={e.name} />
          </div>
        );
      })}
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
    <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 md:px-8 lg:py-5 xl:px-10">
      <div className="flex min-w-0 items-center gap-2.5">
        <ProfilePhoto size={40} priority className="max-lg:size-9!" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold lg:text-[15px]">{settings.ownerName}</span>
          <span className="truncate text-xs text-muted">{settings.ownerRole}</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {settings.portfolioUrl && (
          <a href={settings.portfolioUrl} className="hidden text-sm font-medium text-ink-2 hover:text-ink md:block">
            Ver mi portafolio
          </a>
        )}
        <CurrencySwitch currency={currency} onCurrency={onCurrency} />
      </div>
    </header>
  );
}

function CurrencySwitch({ currency, onCurrency }: { currency: Currency; onCurrency: (c: Currency) => void }) {
  return (
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
            "rounded-full px-2.5 py-1 text-xs lg:px-3 lg:py-1.5 lg:text-[13px]",
            currency === c ? "bg-surface font-semibold text-ink shadow-sm" : "font-medium text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  return (
    <div className="flex w-full gap-1">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cx("h-1 flex-1 rounded-full", i <= step ? "bg-accent" : "bg-[#DDE0E5]")} />
      ))}
    </div>
  );
}

function MobileStepNav({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-surface shadow-card"
        >
          <ChevronLeft size={17} />
        </button>
      )}
      <div className="flex-1">
        <Progress step={step} />
      </div>
      <span className="text-xs font-semibold whitespace-nowrap">Paso {step} de 3</span>
    </div>
  );
}

function Stepper({
  value,
  min = 0,
  label,
  onChange,
}: {
  value: number;
  min?: number;
  label: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full bg-bg p-1">
      <button
        type="button"
        aria-label={`Quitar ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid size-7 place-items-center rounded-full bg-surface disabled:opacity-40"
      >
        <Minus size={15} />
      </button>
      <span className="w-3 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Agregar ${label}`}
        onClick={() => onChange(value + 1)}
        className="grid size-7 place-items-center rounded-full bg-accent text-white"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function Summary({
  project,
  extras,
  qty,
  priceOf,
  totals,
  urgent,
  currency,
  rate,
  canSend,
  onSend,
  formError,
}: {
  project: BuilderItem | null;
  extras: BuilderItem[];
  qty: Record<string, number>;
  priceOf: (e: BuilderItem) => number;
  totals: ReturnType<typeof computeTotals>;
  urgent: boolean;
  currency: Currency;
  rate: number;
  canSend: boolean;
  onSend: () => void;
  formError: string | null;
}) {
  const money = (n: number) => formatIn(currency, n, rate);
  const other = currency === "DOP" ? formatUSD(totals.total) : formatDOP(totals.total, rate);
  const monthly = extras.filter((e) => e.unit === "MONTHLY");
  return (
    <div className="card flex flex-col gap-2.5 rounded-[20px] p-4 lg:gap-3 lg:p-5">
      <h3 className="text-base font-bold tracking-[-0.01em]">Tu cotización</h3>
      {!project && <p className="text-sm text-muted">Elige un tipo de proyecto para empezar.</p>}
      {project && <Line label={project.name} value={money(project.price)} strong />}
      {extras
        .filter((e) => e.unit !== "MONTHLY")
        .map((e) => (
          <Line key={e.id} label={e.unit === "EACH" ? `${e.name} ×${qty[e.id]}` : e.name} value={money(priceOf(e) * qty[e.id])} />
        ))}
      {urgent && totals.urgentFee > 0 && <Line label="Plazo urgente (+20%)" value={money(totals.urgentFee)} />}
      <hr className="border-line" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted">Total estimado</span>
        <span data-total className="text-2xl font-bold tracking-[-0.03em] tabular-nums lg:text-[32px]">
          {money(totals.total)}
        </span>
        <span className="text-xs text-muted">
          {currency === "DOP" ? "=" : "≈"} {other} · US$1 = RD${formatRate(rate)}
        </span>
      </div>
      {project && monthly.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-bg px-3 py-2.5">
          <div className="flex justify-between gap-3 text-[13px] font-semibold">
            <span>Pago mensual</span>
            <span className="tabular-nums">{money(totals.monthly)}/mes</span>
          </div>
          {monthly.map((e) => (
            <div key={e.id} className="flex justify-between gap-3 text-xs text-muted">
              <span>{e.name}</span>
              <span className="tabular-nums">{money(priceOf(e))}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={onSend} className={buttonClass("primary", cx("mt-1 w-full", !canSend && "opacity-60"))}>
        <Send size={17} /> Enviar cotización
      </button>
      {formError ? (
        <p role="alert" className="text-center text-sm font-medium text-[#C53030]">
          {formError}
        </p>
      ) : (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted">
          <Info size={14} className="mt-px shrink-0" />
          Precio de referencia. La reviso y te escribo por WhatsApp para confirmarte.
        </p>
      )}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-[13px] lg:text-sm">
      <span className={strong ? "font-semibold" : "text-ink-2"}>{label}</span>
      <span className={cx("tabular-nums", strong ? "font-semibold" : "font-medium")}>{value}</span>
    </div>
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
      <label htmlFor={id} className="text-xs font-semibold text-ink-2">
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
