"use client";

import { CircleExclamationPoint, RotateCcw } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 pt-24 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-[#FDEDED] text-[#C53030]">
        <CircleExclamationPoint size={26} />
      </span>
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="text-sm text-muted">No se pudo cargar esta parte del panel. Revisa tu conexión e inténtalo otra vez.</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={reset} className={buttonClass("dark", "h-12 text-sm")}>
          <RotateCcw size={17} /> Reintentar
        </button>
        <Link href="/admin" className={buttonClass("soft", "h-12 text-sm")}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
