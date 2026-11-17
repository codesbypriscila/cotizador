import { FileText, ReceiptText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton, PageShell } from "@/components/admin";
import { buttonClass } from "@/components/ui";
import { getClientsWithBalance } from "../client-data";
import { ClientForm } from "../client-form";
import { ClientProfile } from "../client-profile";

export default async function ClientPage({ params }: PageProps<"/admin/clientes/[id]">) {
  const { id } = await params;
  const client = (await getClientsWithBalance()).find((c) => c.id === id);
  if (!client) notFound();

  return (
    <PageShell className="max-w-[1100px]">
      <BackButton href="/admin/clientes" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex flex-col gap-4">
          <ClientProfile client={client} layout="page" />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href={`/admin/cotizaciones/nueva?cliente=${client.id}`}
              className={buttonClass("primary", "h-12 px-4 text-sm sm:flex-1")}
            >
              <FileText size={17} /> Nueva cotización
            </Link>
            <Link
              href={`/admin/facturas/nueva?cliente=${client.id}`}
              className={buttonClass("soft", "h-12 px-4 text-sm sm:flex-1")}
            >
              <ReceiptText size={17} /> Nueva factura
            </Link>
          </div>
        </div>
        <ClientForm
          id={client.id}
          values={{ name: client.name, contact: client.contact, phone: client.phone, email: client.email, notes: client.notes }}
        />
      </div>
    </PageShell>
  );
}
