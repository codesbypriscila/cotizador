"use client";

import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { useActionState } from "react";
import { buttonClass } from "@/components/ui";
import { login } from "../actions";

const field = "flex h-[54px] items-center gap-2.5 rounded-full bg-bg px-[18px] focus-within:ring-2 focus-within:ring-accent/40";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Correo</span>
        <span className={field}>
          <Mail size={18} className="text-muted" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state?.email}
            className="w-full bg-transparent text-[15px] outline-none"
          />
        </span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-2">Contraseña</span>
        <span className={field}>
          <LockKeyhole size={18} className="text-muted" />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full bg-transparent text-[15px] outline-none"
          />
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-[#C53030]">
          {state.error}
        </p>
      )}
      <p className="text-[13px] text-muted">¿Olvidaste tu contraseña? Cámbiala con npm run admin:set.</p>
      <button type="submit" disabled={pending} className={buttonClass("primary", "mt-2 h-14 w-full")}>
        <LogIn size={20} />
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
