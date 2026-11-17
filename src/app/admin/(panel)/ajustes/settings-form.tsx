"use client";

import { Check, RefreshCw } from "lucide-react";
import { useActionState, useRef } from "react";
import { Req } from "@/components/form";
import { buttonClass, cx, inputClass } from "@/components/ui";
import { formatRate } from "@/lib/money";
import { DEFAULT_TEMPLATE, TEMPLATE_VARIABLES } from "@/lib/whatsapp";
import { refreshRate, saveSettings } from "../../actions";

type Values = {
  whatsapp: string;
  messageTemplate: string;
  businessName: string;
  taxId: string;
  ownerName: string;
  ownerRole: string;
  portfolioUrl: string;
};

export function SettingsForm({ values, rate }: { values: Values; rate: { rate: number; label: string } }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  const template = useRef<HTMLTextAreaElement>(null);

  function insert(v: string) {
    const el = template.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    el.value = value.slice(0, s) + v + value.slice(e);
    el.focus();
    el.setSelectionRange(s + v.length, s + v.length);
  }

  const section = "card flex flex-col gap-3 p-[18px]";
  const label = "text-xs font-semibold text-ink-2";

  return (
    <form action={action} className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
      <div className="flex flex-col gap-4 lg:gap-5">
        <section className={section}>
          <h2 className="font-bold">Tu perfil</h2>
          <label className="flex flex-col gap-1.5">
            <span className={label}>
              Nombre (sale en el cotizador) <Req />
            </span>
            <input name="ownerName" required defaultValue={values.ownerName} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Rol</span>
            <input name="ownerRole" defaultValue={values.ownerRole} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Enlace a tu portafolio</span>
            <input
              name="portfolioUrl"
              type="url"
              placeholder="https://"
              defaultValue={values.portfolioUrl}
              className={inputClass}
            />
          </label>
        </section>
        <section className={section}>
          <h2 className="font-bold">Contacto y moneda</h2>
          <label className="flex flex-col gap-1.5">
            <span className={label}>
              Tu WhatsApp (con código de país) <Req />
            </span>
            <input
              name="whatsapp"
              required
              inputMode="tel"
              defaultValue={values.whatsapp}
              placeholder="18090000000"
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className={label}>Tasa del dólar (se actualiza sola cada 6 horas)</span>
            <div className="flex items-center justify-between gap-3 rounded-[14px] bg-bg px-4 py-3">
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold tabular-nums">US$1 = RD${formatRate(rate.rate)}</span>
                <span className="text-xs text-muted">{rate.label}</span>
              </span>
              <button
                formAction={refreshRate}
                formNoValidate
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-xs font-semibold shadow-card"
              >
                <RefreshCw size={14} /> Actualizar
              </button>
            </div>
            <span className="text-xs text-muted">
              Todos los precios se escriben en US$. El cotizador muestra pesos con esta tasa.
            </span>
          </div>
        </section>
        <section className={section}>
          <h2 className="font-bold">Datos de facturación</h2>
          <label className="flex flex-col gap-1.5">
            <span className={label}>
              Nombre comercial <Req />
            </span>
            <input name="businessName" required defaultValue={values.businessName} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>RNC / Cédula</span>
            <input name="taxId" defaultValue={values.taxId} placeholder="000-0000000-0" className={inputClass} />
          </label>
        </section>
      </div>

      <section className={section}>
        <h2 className="font-bold">
          Plantilla del mensaje <Req />
        </h2>
        <p className="text-[13px] text-muted">
          Es el correo que le queda escrito al cliente cuando envía su cotización (llega a tu correo). Las líneas con datos vacíos
          se quitan solas.
        </p>
        <textarea
          ref={template}
          name="messageTemplate"
          required
          defaultValue={values.messageTemplate}
          className={cx(inputClass, "h-auto min-h-[240px] resize-y py-3 text-[13px] leading-relaxed")}
        />
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insert(v)}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-ink"
            >
              {v}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (template.current) template.current.value = DEFAULT_TEMPLATE;
          }}
          className="w-fit text-[13px] font-medium text-accent-ink"
        >
          Restaurar plantilla original
        </button>
      </section>

      <div className="flex flex-col gap-2 lg:col-span-2 lg:flex-row lg:items-center">
        <button disabled={pending} className={buttonClass("dark", "lg:w-64")}>
          {state && "ok" in state && !pending ? <Check size={18} /> : null}
          {pending ? "Guardando…" : state && "ok" in state ? "Guardado" : "Guardar ajustes"}
        </button>
        {state?.error && <p className="text-sm font-medium text-[#C53030]">{state.error}</p>}
      </div>
    </form>
  );
}
