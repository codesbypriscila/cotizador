import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-bold tracking-tight text-chip">404</p>
      <h1 className="text-2xl font-bold">Esta página no existe</h1>
      <p className="text-sm text-muted">Puede que el enlace esté mal escrito o que lo hayan borrado.</p>
      <Link href="/" className={buttonClass("primary", "h-12 text-sm")}>
        Ir al cotizador
      </Link>
    </main>
  );
}
