"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { FieldError, FieldLabel, invalid } from "@/components/form";
import { buttonClass, cx, inputClass } from "@/components/ui";
import { deleteClient, saveClient } from "../../actions";

type ClientValues = { name: string; contact: string; phone: string; email: string; notes: string };

export function ClientForm({ id, values }: { id: string | null; values: ClientValues }) {
  const [state, action, pending] = useActionState(saveClient.bind(null, id), undefined);
  const errors: Partial<Record<keyof ClientValues, string>> = (state && "fieldErrors" in state && state.fieldErrors) || {};
  const saved = state && "ok" in state && !pending;
  const typed: Partial<ClientValues> = (state && "values" in state && state.values) || {};

  const field = (
    name: keyof ClientValues,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> & { hint?: string } = {},
  ) => {
    const { hint, ...input } = extra;
    const fid = `cliente-${name}`;
    return (
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={fid} required={input.required}>
          {label}
        </FieldLabel>
        <input
          id={fid}
          name={name}
          defaultValue={typed[name] ?? values[name]}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${fid}-error` : undefined}
          className={cx(inputClass, invalid(errors[name]))}
          {...input}
        />
        <FieldError id={`${fid}-error`}>{errors[name]}</FieldError>
        {hint && !errors[name] && <span className="text-xs text-muted">{hint}</span>}
      </div>
    );
  };

  return (
    // key: after a save the inputs keep what the server stored
    <form action={action} noValidate className="card flex flex-col gap-3.5 p-[18px]">
      <h2 className="text-[17px] font-bold">{id ? "Datos del cliente" : "Nuevo cliente"}</h2>
      {field("name", "Nombre del negocio o persona", { required: true, maxLength: 80 })}
      <div className="grid gap-3.5 md:grid-cols-2">
        {field("contact", "Persona de contacto", { maxLength: 60, hint: "Solo letras y espacios." })}
        {field("phone", "WhatsApp / teléfono", {
          inputMode: "tel",
          placeholder: "809-555-0000",
          maxLength: 20,
          hint: "Necesario para enviarle cotizaciones y recordatorios.",
        })}
      </div>
      {field("email", "Correo", { type: "email", maxLength: 120 })}
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="cliente-notes">Nota interna</FieldLabel>
        <textarea
          id="cliente-notes"
          name="notes"
          defaultValue={typed.notes ?? values.notes}
          maxLength={2000}
          className={cx(inputClass, "h-auto min-h-[84px] resize-y py-3")}
        />
      </div>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm font-medium text-[#C53030]">
          Revisa los campos marcados en rojo.
        </p>
      )}
      <button disabled={pending} className={buttonClass("dark", "w-full")}>
        {saved && !Object.keys(errors).length ? <Check size={18} /> : null}
        {pending ? "Guardando…" : saved && !Object.keys(errors).length ? "Guardado" : id ? "Guardar cambios" : "Crear cliente"}
      </button>
      {id && (
        <ConfirmButton
          question="¿Borrar el cliente con sus cotizaciones y facturas?"
          onConfirm={() => deleteClient(id)}
          className="py-1 text-sm font-medium text-[#C53030] hover:underline"
        >
          Borrar cliente
        </ConfirmButton>
      )}
    </form>
  );
}
