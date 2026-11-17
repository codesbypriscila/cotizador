"use client";

import { ArrowUp, Mail, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { FieldError } from "@/components/form";
import { cx } from "@/components/ui";
import { emailError } from "@/lib/validation";
import { sendClientEmail } from "../../actions";

type Props = {
  clientId: string;
  clientEmail: string;
  greetingName: string;
  from: string | null; // sending Gmail, null when not configured
  signature: string;
  compact?: boolean; // icon-only trigger (side panel)
};

/**
 * "Nuevo mensaje" sheet, like the phone's mail app: opens inside the admin and
 * sends from the admin's Gmail. Bottom sheet on phones, centered window on desktop.
 */
export function EmailComposer({ clientId, clientEmail, greetingName, from, signature, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(clientEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<{ to?: string; subject?: string; body?: string; form?: string }>({});
  const [sent, setSent] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const subjectRef = useRef<HTMLInputElement>(null);

  function openSheet() {
    setTo(clientEmail);
    setSubject("");
    setBody(`Hola ${greetingName},\n\n\n\n${signature}`);
    setErrors({});
    setSent(null);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => (clientEmail ? subjectRef.current : document.getElementById("correo-para"))?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, pending, clientEmail]);

  function send() {
    const next = {
      to: emailError(to) ?? (to.trim() ? undefined : "Escribe el correo del cliente."),
      subject: subject.trim() ? (subject.length > 150 ? "Máximo 150 caracteres." : undefined) : "Escribe un asunto.",
      body: body.trim() ? undefined : "Escribe el mensaje.",
    };
    setErrors(next);
    if (next.to || next.subject || next.body) return;
    start(async () => {
      const res = await sendClientEmail(clientId, { to, subject, body });
      if (res.ok) {
        setSent(to.trim());
        setOpen(false);
      } else setErrors({ ...res.fieldErrors, form: res.error });
    });
  }

  const mailto = `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label="Correo"
        className={cx(
          "flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold",
          compact ? "w-10 bg-bg xl:w-auto xl:flex-1 xl:px-3" : "bg-surface px-4 shadow-card",
        )}
      >
        <Mail size={15} />
        <span className={cx(compact && "max-xl:hidden")}>Correo</span>
      </button>
      {sent && (
        <span role="status" className="w-full text-center text-xs font-medium text-[#1E8A4C]">
          Correo enviado a {sent}
        </span>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 md:items-center md:p-6"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="correo-titulo"
            onClick={(e) => e.stopPropagation()}
            className="flex h-[92dvh] w-full flex-col rounded-t-[28px] bg-white shadow-float md:h-auto md:max-h-[85dvh] md:max-w-xl md:rounded-[28px]"
          >
            <span className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-chip md:hidden" aria-hidden />
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <button type="button" onClick={() => setOpen(false)} disabled={pending} className="text-[17px] text-accent-ink">
                <span className="md:hidden">Cancelar</span>
                <X size={20} className="max-md:hidden" aria-label="Cerrar" />
              </button>
              <button
                type="button"
                onClick={send}
                disabled={pending || !from}
                aria-label="Enviar correo"
                className="grid size-11 place-items-center rounded-full bg-accent text-white disabled:bg-[#C9CCD2]"
              >
                <ArrowUp size={22} strokeWidth={2.5} />
              </button>
            </div>
            <h2 id="correo-titulo" className="px-5 pb-3 text-[28px] font-bold tracking-[-0.03em]">
              {pending ? "Enviando…" : "Nuevo mensaje"}
            </h2>

            {!from && (
              <div className="mx-5 mb-3 flex flex-col gap-2 rounded-2xl bg-[#FFF8DD] p-3.5 text-[13px] text-[#5E4A00]">
                <p>
                  Para enviar desde tu Gmail falta configurar <b>SMTP_USER</b> y <b>SMTP_PASSWORD</b> (una contraseña de
                  aplicación de Google). Mientras tanto puedes abrirlo en tu app de correo.
                </p>
                <a href={mailto} className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink">
                  Abrir en mi app de correo
                </a>
              </div>
            )}

            <div className="flex flex-col border-t border-line">
              <label className="flex items-center gap-2 border-b border-line px-5 py-3">
                <span className="text-[15px] text-muted">Para:</span>
                <input
                  id="correo-para"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  aria-invalid={Boolean(errors.to)}
                  aria-describedby={errors.to ? "correo-para-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                  placeholder="correo@cliente.com"
                />
              </label>
              {errors.to && (
                <span className="px-5 pt-1">
                  <FieldError id="correo-para-error">{errors.to}</FieldError>
                </span>
              )}
              <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[15px] text-muted">
                De: <span className="truncate">{from ?? "tu Gmail (sin configurar)"}</span>
              </div>
              <label className="flex items-center gap-2 border-b border-line px-5 py-3">
                <span className="text-[15px] text-muted">Asunto:</span>
                <input
                  ref={subjectRef}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={150}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "correo-asunto-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                />
              </label>
              {errors.subject && (
                <span className="px-5 pt-1">
                  <FieldError id="correo-asunto-error">{errors.subject}</FieldError>
                </span>
              )}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Mensaje"
              aria-invalid={Boolean(errors.body)}
              maxLength={5000}
              className="min-h-[220px] flex-1 resize-none px-5 py-4 text-[15px] leading-relaxed outline-none"
            />
            {(errors.body || errors.form) && (
              <p role="alert" className="px-5 pb-4 text-sm font-medium text-[#C53030]">
                {errors.form ?? errors.body}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
