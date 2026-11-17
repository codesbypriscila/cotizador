import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ClientWithBalance } from "./client-data";
import { ClientProfile } from "./client-profile";

export function ClientPanel({ client }: { client: ClientWithBalance }) {
  return (
    <aside className="card hidden w-[340px] shrink-0 flex-col gap-4 overflow-y-auto p-[22px] lg:flex xl:w-[380px]">
      <ClientProfile client={client} layout="panel" />
      <Link
        href={`/admin/clientes/${client.id}`}
        className="mt-auto flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-accent-ink"
      >
        Abrir ficha completa <ArrowRight size={15} />
      </Link>
    </aside>
  );
}
