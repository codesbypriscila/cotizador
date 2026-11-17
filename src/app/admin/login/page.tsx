import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar · Cotizador" };

/** Admin login: only the form, on a white page (phone and desktop). */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 py-10">
      <div className="flex w-full max-w-[400px] flex-col gap-7 lg:gap-[22px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[34px] font-bold tracking-[-0.035em] lg:text-4xl">Hola de nuevo</h1>
          <p className="text-[15px] leading-relaxed text-muted">Entra para ver tus cotizaciones, facturas y clientes.</p>
        </div>
        <LoginForm />
        <p className="text-xs text-muted">Solo tú tienes acceso al panel.</p>
      </div>
    </main>
  );
}
