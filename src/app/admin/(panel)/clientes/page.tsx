import { UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { EmptyState, FilterChips, PageHeader, PageShell, SearchBox } from "@/components/admin";
import { buttonClass, cx } from "@/components/ui";
import { matches } from "@/lib/data";
import { getAdminMoney } from "@/lib/admin-money";
import { ClientPanel } from "./client-panel";
import { type ClientWithBalance, getClientsWithBalance } from "./client-data";

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "saldo", label: "Con saldo" },
  { value: "recientes", label: "Recientes" },
];

function balanceText(c: ClientWithBalance, fmt: (cents: number) => string) {
  if (c.balanceLabel === "Debe") return `Debe ${fmt(c.pending)}`;
  return c.balanceLabel;
}

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clientes">) {
  const sp = await searchParams;
  const { fmt } = await getAdminMoney();
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const filtro = typeof sp.filtro === "string" ? sp.filtro : "todos";
  const selectedId = typeof sp.id === "string" ? sp.id : undefined;

  const all = await getClientsWithBalance();
  const monthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
  const list = all.filter(
    (c) =>
      (filtro === "saldo" ? c.pending > 0 : filtro === "recientes" ? c.createdAt.getTime() > monthAgo : true) &&
      matches(q, c.name, c.contact, c.phone, c.email),
  );
  const selected = list.find((c) => c.id === selectedId) ?? list[0];
  const href = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ filtro: filtro === "todos" ? undefined : filtro, q, ...extra })) if (v) p.set(k, v);
    return `/admin/clientes?${p}`;
  };

  return (
    <PageShell className="max-w-[1400px] lg:h-dvh lg:pb-8">
      <PageHeader
        title="Clientes"
        count={`${all.length} ${all.length === 1 ? "cliente" : "clientes"}`}
        actions={
          <Link href="/admin/clientes/nuevo" className={buttonClass("primary", "h-[46px] px-5 text-sm max-lg:hidden")}>
            <UserPlus size={18} /> Nuevo cliente
          </Link>
        }
      />
      <div className="flex gap-2.5">
        <SearchBox
          placeholder="Buscar por nombre o teléfono…"
          q={q}
          hidden={{ filtro: filtro === "todos" ? undefined : filtro }}
          className="flex-1 lg:max-w-md lg:flex-none lg:basis-md"
        />
        <Link
          href="/admin/clientes/nuevo"
          aria-label="Nuevo cliente"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface shadow-card lg:hidden"
        >
          <UserPlus size={18} />
        </Link>
      </div>
      <FilterChips
        options={FILTERS}
        active={filtro}
        hrefFor={(v) => href({ filtro: v === "todos" ? undefined : v, id: undefined })}
      />

      {list.length === 0 ? (
        <EmptyState icon={Users} title="No hay clientes aquí" />
      ) : (
        <div className="flex min-h-0 flex-1 gap-5">
          <div className="card min-w-0 flex-1 overflow-y-auto px-4 py-1 lg:px-[22px] lg:py-2">
            <div className="hidden gap-4 border-b border-line px-2.5 py-3 text-xs font-medium text-muted lg:flex">
              <span className="flex-1">Cliente</span>
              <span className="w-[120px]">Teléfono</span>
              <span className="w-[110px] text-right">Facturado</span>
              <span className="w-[130px] text-right">Saldo</span>
            </div>
            {list.map((c) => {
              const sel = c.id === selected?.id;
              const alert = c.balanceLabel === "Debe" || c.balanceLabel === "Vencida";
              return (
                <div
                  key={c.id}
                  className={cx(
                    "border-b border-line last:border-0",
                    sel && "lg:rounded-[14px] lg:border-transparent lg:bg-accent-soft",
                  )}
                >
                  {/* Phone: open the client page. Desktop: select in the side panel. */}
                  {[
                    { cls: "lg:hidden", to: `/admin/clientes/${c.id}` },
                    { cls: "hidden lg:flex", to: href({ id: c.id }) },
                  ].map(({ cls, to }) => (
                    <Link
                      key={cls}
                      href={to}
                      scroll={false}
                      className={cx("flex items-center gap-3 py-3 lg:gap-4 lg:px-2.5 lg:py-3", cls)}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold">{c.name}</span>
                        <span className="truncate text-xs text-muted">
                          <span className="lg:hidden">{c.phone || c.contact || "Sin teléfono"}</span>
                          <span className="max-lg:hidden">{c.contact || "—"}</span>
                        </span>
                      </span>
                      <span className="hidden w-[120px] text-[13px] text-ink-2 lg:block">{c.phone || "—"}</span>
                      <span className="flex flex-col items-end gap-0.5 lg:contents">
                        <span className="text-[13px] font-semibold tabular-nums lg:w-[110px] lg:text-sm lg:text-right">
                          {c.billed ? fmt(c.billed) : "—"}
                        </span>
                        <span
                          className={cx(
                            "text-[11px] lg:w-[130px] lg:text-right lg:text-[13px]",
                            alert ? "font-medium" : "text-muted",
                          )}
                          style={alert ? { color: c.balanceLabel === "Vencida" ? "#C53030" : "#2C6FD8" } : undefined}
                        >
                          {balanceText(c, fmt)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
          {selected && <ClientPanel client={selected} />}
        </div>
      )}
    </PageShell>
  );
}
