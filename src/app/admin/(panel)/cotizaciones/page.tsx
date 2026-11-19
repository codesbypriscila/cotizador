import { FileText, Inbox, Plus } from "lucide-react";
import Link from "next/link";
import { DocCard, EmptyState, FilterChips, PageHeader, PageShell, SearchBox } from "@/components/admin";
import { buttonClass } from "@/components/ui";
import { getQuotes, matches } from "@/lib/data";
import { formatDate, formatRelative, quoteNumber } from "@/lib/format";
import { getAdminMoney } from "@/lib/admin-money";

const FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendiente" },
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "web", label: "Del cotizador" },
];
const STATUS = { pendiente: "PENDING", borrador: "DRAFT", enviada: "SENT", aceptada: "ACCEPTED", rechazada: "REJECTED" } as const;

export default async function QuotesPage({ searchParams }: PageProps<"/admin/cotizaciones">) {
  const sp = await searchParams;
  const { fmt } = await getAdminMoney();
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const estado = typeof sp.estado === "string" ? sp.estado : sp.origen === "web" ? "web" : "todas";

  const all = await getQuotes();
  const list = all.filter(
    (x) =>
      (estado === "todas" || (estado === "web" ? x.source === "PUBLIC" : x.status === STATUS[estado as keyof typeof STATUS])) &&
      matches(q, x.client.name, x.title, quoteNumber(x.number), x.client.contact),
  );
  const href = (v: string) =>
    `/admin/cotizaciones?${new URLSearchParams({ ...(v !== "todas" && { estado: v }), ...(q && { q }) })}`;

  return (
    <PageShell>
      <PageHeader
        title="Cotizaciones"
        count={`${all.length} en total`}
        actions={
          <Link href="/admin/cotizaciones/nueva" className={buttonClass("primary", "h-[46px] text-sm max-lg:hidden")}>
            <Plus size={18} /> Nueva cotización
          </Link>
        }
      />
      <SearchBox
        placeholder="Buscar cotizaciones…"
        q={q}
        hidden={{ estado: estado === "todas" ? undefined : estado }}
        className="lg:max-w-md"
      />
      <FilterChips options={FILTERS} active={estado} hrefFor={href} />
      {list.length === 0 ? (
        <EmptyState icon={FileText} title="No hay cotizaciones aquí">
          {q ? "Prueba con otra búsqueda." : "Crea una con el botón +."}
        </EmptyState>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 lg:gap-3 xl:grid-cols-3">
          {list.map((x) => (
            <DocCard
              key={x.id}
              href={`/admin/cotizaciones/${x.id}`}
              icon={x.source === "PUBLIC" && !x.seenAt ? Inbox : FileText}
              title={x.client.name}
              subtitle={x.title}
              amount={fmt(x.total)}
              number={quoteNumber(x.number)}
              status={x.status}
              date={x.source === "PUBLIC" && !x.seenAt ? formatRelative(x.createdAt) : formatDate(x.createdAt)}
              highlight={x.source === "PUBLIC" && !x.seenAt}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
