"use client";

import { buttonClass } from "@/components/ui";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">No se pudo cargar el cotizador</h1>
      <p className="text-sm text-muted">Inténtalo de nuevo en unos segundos.</p>
      <button type="button" onClick={reset} className={buttonClass("primary", "h-12 text-sm")}>
        Reintentar
      </button>
    </main>
  );
}
