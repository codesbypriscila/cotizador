"use client";

import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { CATALOG_ICONS, CatalogIcon } from "@/components/icon";
import { buttonClass, cx, inputClass, Toggle } from "@/components/ui";
import { Req } from "@/components/form";
import { MoneyInput } from "@/components/money-input";
import { formatDOP, formatRate, formatUSD } from "@/lib/money";
import { deleteCatalogItem, moveCatalogItem, saveCatalogItem, setCatalogVisible } from "../../actions";

type Unit = "ONCE" | "EACH" | "MONTHLY";
export type CatalogValues = {
  kind: "PROJECT" | "EXTRA";
  name: string;
  description: string;
  icon: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  unit: Unit;
  visible: boolean;
  required: boolean;
};

export function CatalogForm({
  id,
  values,
  rate,
  closeHref,
  saved,
}: {
  id: string | null;
  values: CatalogValues;
  rate: number; // pesos per US$1
  closeHref: string;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveCatalogItem.bind(null, id), undefined);
  const [v, setV] = useState(values);
  const set = <K extends keyof CatalogValues>(k: K, val: CatalogValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const isExtra = v.kind === "EXTRA";

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <input type="hidden" name="kind" value={v.kind} />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{id ? "Editar servicio" : isExtra ? "Nuevo extra" : "Nuevo tipo de proyecto"}</h2>
        <Link href={closeHref} scroll={false} aria-label="Cerrar" className="text-muted hover:text-ink">
          <X size={20} />
        </Link>
      </div>
      <Field label="Nombre" required>
        <input
          name="name"
          required
          maxLength={80}
          value={v.name}
          onChange={(e) => set("name", e.target.value)}
          className={cx(inputClass, "font-semibold")}
        />
      </Field>
      <Field label="Descripción corta">
        <input
          name="description"
          maxLength={120}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Ícono" required>
        <input type="hidden" name="icon" value={v.icon} />
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(CATALOG_ICONS).map((name) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={v.icon === name}
              onClick={() => set("icon", name)}
              className={cx(
                "grid size-9 place-items-center rounded-xl",
                v.icon === name ? "bg-accent-soft text-accent-ink ring-2 ring-accent" : "bg-bg text-ink-2 hover:bg-chip",
              )}
            >
              <CatalogIcon name={name} size={17} />
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label={v.unit === "MONTHLY" ? "Precio base al mes (US$)" : "Precio base (US$)"} required>
          <Money name="price" value={v.price} onChange={(n) => set("price", n)} bold />
        </Field>
        <Field label={`En pesos (US$1 = RD$${formatRate(rate)})`}>
          <span className={cx(inputClass, "flex items-center text-muted")}>{formatDOP(v.price, rate)}</span>
        </Field>
        <Field label="Mercado mín.">
          <Money name="minPrice" value={v.minPrice} onChange={(n) => set("minPrice", n)} />
        </Field>
        <Field label="Mercado máx.">
          <Money name="maxPrice" value={v.maxPrice} onChange={(n) => set("maxPrice", n)} />
        </Field>
      </div>
      {isExtra && (
        <Field label="Cómo se cobra">
          <input type="hidden" name="unit" value={v.unit} />
          <div className="flex gap-1.5">
            {(
              [
                ["ONCE", "Precio único"],
                ["EACH", "Por cantidad"],
                ["MONTHLY", "Mensual"],
              ] as const
            ).map(([u, l]) => (
              <button
                key={u}
                type="button"
                aria-pressed={v.unit === u}
                onClick={() => set("unit", u)}
                className={cx(
                  "h-10 flex-1 rounded-full text-[13px]",
                  v.unit === u ? "bg-accent font-medium text-white" : "bg-chip text-[#6B7079]",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>
      )}
      {isExtra && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium">Obligatorio</span>
            <span className="text-xs text-muted">Siempre va incluido; el cliente no lo puede quitar.</span>
          </span>
          <Toggle checked={v.required} onChange={(b) => set("required", b)} label="Obligatorio" name="required" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Visible en el cotizador</span>
        <Toggle checked={v.visible} onChange={(b) => set("visible", b)} label="Visible en el cotizador" name="visible" />
      </div>

      <span className="text-xs font-semibold text-ink-2">Así lo ve el cliente</span>
      <div className="flex justify-center rounded-[18px] bg-bg p-4">
        {isExtra ? (
          <div className="flex w-full items-center gap-3.5 rounded-[20px] border-[1.5px] border-accent bg-surface p-4 shadow-card">
            <span className="grid size-11 place-items-center rounded-[14px] bg-accent-soft text-accent-ink">
              <CatalogIcon name={v.icon} size={22} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-semibold">{v.name || "Nombre"}</span>
              <span className="text-[13px] text-muted">
                {v.unit === "EACH"
                  ? `${formatUSD(v.price)} c/u`
                  : v.unit === "MONTHLY"
                    ? `${formatUSD(v.price)}/mes · aparte`
                    : `+${formatUSD(v.price)}`}
              </span>
            </span>
            {v.required ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">Incluido</span>
            ) : (
              <span className="relative h-7 w-12 rounded-full bg-accent p-[3px]">
                <span className="block size-[22px] translate-x-5 rounded-full bg-white" />
              </span>
            )}
          </div>
        ) : (
          <div className="relative flex w-[200px] flex-col gap-3 rounded-[22px] border-2 border-accent bg-surface p-4 shadow-card">
            <span className="grid size-11 place-items-center rounded-[14px] bg-accent-soft text-accent-ink">
              <CatalogIcon name={v.icon} size={22} />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{v.name || "Nombre"}</span>
              <span className="text-[13px] text-muted">desde {formatUSD(v.price)}</span>
            </span>
            <span className="absolute top-3.5 right-3.5 grid size-6 place-items-center rounded-full bg-accent text-white">
              <Check size={14} strokeWidth={3} />
            </span>
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm font-medium text-[#C53030]">{state.error}</p>}
      <button disabled={pending} className={buttonClass("dark", "h-12 w-full text-sm")}>
        {saved && !pending ? <Check size={17} /> : null}
        {pending ? "Guardando…" : saved ? "Guardado · guardar de nuevo" : "Guardar cambios"}
      </button>
      {id && (
        <ConfirmButton
          question={`¿Borrar “${v.name}” del catálogo?`}
          onConfirm={() => deleteCatalogItem(id)}
          className="text-sm font-medium text-[#C53030] hover:underline"
        >
          Borrar del catálogo
        </ConfirmButton>
      )}
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-2">
        {label} {required && <Req />}
      </span>
      {children}
    </div>
  );
}

function Money({ name, value, onChange, bold }: { name: string; value: number; onChange: (n: number) => void; bold?: boolean }) {
  return (
    <MoneyInput
      name={name}
      label={name}
      value={value}
      onChange={onChange}
      className={cx(inputClass, "focus-within:ring-2 focus-within:ring-accent/40")}
      inputClassName={bold ? "font-semibold" : undefined}
    />
  );
}

/** Up/down arrows that change the order shown in the public quote builder. */
export function MoveButtons({ id, name, first, last }: { id: string; name: string; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const btn = "grid size-7 place-items-center rounded-full bg-bg text-ink-2 hover:bg-chip disabled:opacity-30";
  return (
    <>
      <button
        type="button"
        aria-label={`Subir ${name}`}
        disabled={first || pending}
        onClick={() => start(() => moveCatalogItem(id, -1))}
        className={btn}
      >
        <ChevronUp size={15} />
      </button>
      <button
        type="button"
        aria-label={`Bajar ${name}`}
        disabled={last || pending}
        onClick={() => start(() => moveCatalogItem(id, 1))}
        className={btn}
      >
        <ChevronDown size={15} />
      </button>
    </>
  );
}

export function VisibleToggle({ id, visible, name }: { id: string; visible: boolean; name: string }) {
  const [on, setOn] = useState(visible);
  const [, start] = useTransition();
  return (
    <Toggle
      checked={on}
      label={`Mostrar ${name} en el cotizador`}
      onChange={(b) => {
        setOn(b);
        start(() => setCatalogVisible(id, b));
      }}
    />
  );
}
