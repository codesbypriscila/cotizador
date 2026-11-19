import { ExternalLink, PencilLine, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/admin";
import { CatalogIcon } from "@/components/icon";
import { buttonClass, cx } from "@/components/ui";
import { getRate } from "@/lib/rate";
import { getAdminMoney } from "@/lib/admin-money";
import { prisma } from "@/lib/prisma";
import { CatalogForm, type CatalogValues, MoveButtons, VisibleToggle } from "./catalog-form";

export default async function CatalogPage({ searchParams }: PageProps<"/admin/catalogo">) {
  const sp = await searchParams;
  const { fmt } = await getAdminMoney();
  const tab = sp.tipo === "extras" ? "extras" : "proyectos";
  const kind = tab === "extras" ? "EXTRA" : "PROJECT";
  const editingId = typeof sp.id === "string" ? sp.id : undefined;
  const creating = sp.nuevo === "1";

  const [items, counts, rate] = await Promise.all([
    prisma.catalogItem.findMany({ where: { kind }, orderBy: { sortOrder: "asc" } }),
    prisma.catalogItem.groupBy({ by: ["kind"], _count: true }),
    getRate(),
  ]);
  const count = (k: string) => counts.find((c) => c.kind === k)?._count ?? 0;
  const editing = items.find((i) => i.id === editingId);
  const base = `/admin/catalogo?tipo=${tab}`;

  const formValues: CatalogValues | null = editing
    ? { ...editing }
    : creating
      ? {
          kind,
          name: "",
          description: "",
          icon: kind === "EXTRA" ? "files" : "monitor",
          price: 0,
          minPrice: 0,
          maxPrice: 0,
          unit: "ONCE",
          visible: true,
          required: false,
          maintenancePrice: null,
        }
      : null;

  const form = formValues && (
    <CatalogForm
      key={editing?.id ?? `new-${kind}`}
      id={editing?.id ?? null}
      values={formValues}
      rate={rate.rate}
      closeHref={base}
      saved={sp.guardado === "1"}
    />
  );

  return (
    <PageShell className="max-w-[1400px]">
      <PageHeader
        title="Catálogo"
        subtitle="Lo que guardes aquí es lo que ve el cliente en tu cotizador."
        back="/admin"
        actions={
          <>
            <a href="/" target="_blank" className={buttonClass("outline", "h-[46px] px-4 text-sm max-lg:hidden")}>
              <ExternalLink size={16} /> Ver cotizador
            </a>
            <Link href={`${base}&nuevo=1`} scroll={false} className={buttonClass("primary", "h-[46px] px-5 text-sm")}>
              <Plus size={18} /> Nuevo {tab === "extras" ? "extra" : "servicio"}
            </Link>
          </>
        }
      />
      <p className="flex items-center gap-2.5 rounded-2xl bg-[#FFF8DD] px-4 py-3 text-[13px] leading-snug text-[#5E4A00]">
        <PencilLine size={18} className="shrink-0 text-[#9A7400]" />
        Todos los precios van en dólares (US$). El cotizador los muestra en pesos con la tasa del día. Son precios de ejemplo del
        mercado freelance en RD: ajústalos a tu gusto.
      </p>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="card flex min-w-0 flex-1 flex-col gap-1 px-4 py-4 lg:px-[22px]">
          <div className="flex rounded-full bg-chip p-1 lg:w-fit">
            {[
              ["proyectos", `Proyectos · ${count("PROJECT")}`],
              ["extras", `Extras · ${count("EXTRA")}`],
            ].map(([t, label]) => (
              <Link
                key={t}
                href={`/admin/catalogo?tipo=${t}`}
                scroll={false}
                aria-current={tab === t ? "page" : undefined}
                className={cx(
                  "flex h-10 flex-1 items-center justify-center rounded-full px-[18px] text-[13px] lg:flex-none",
                  tab === t ? "bg-surface font-semibold shadow-card" : "font-medium text-muted",
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile: the form opens on top of the list */}
          {form && <div className="my-3 rounded-3xl border-[1.5px] border-accent p-4 xl:hidden">{form}</div>}

          <div className="mt-3 hidden gap-4 border-b border-line px-2.5 pb-2.5 text-xs font-medium text-muted lg:flex">
            <span className="flex-1">Servicio</span>
            <span className="hidden w-[150px] 2xl:block">Rango de mercado</span>
            <span className="w-[130px]">Precio base</span>
            <span className="w-[60px] text-center">Orden</span>
            <span className="w-[60px] text-center">Visible</span>
          </div>
          {items.map((it, index) => {
            const sel = it.id === editing?.id;
            return (
              <div
                key={it.id}
                className={cx(
                  "flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line py-3 last:border-0 lg:flex-nowrap lg:gap-4 lg:px-2.5",
                  sel && "lg:rounded-[14px] lg:border-transparent lg:bg-accent-soft",
                )}
              >
                <Link
                  href={`${base}&id=${it.id}`}
                  scroll={false}
                  className="flex min-w-0 basis-full items-center gap-3 lg:flex-1 lg:basis-auto"
                >
                  <span
                    className={cx(
                      "grid size-[38px] shrink-0 place-items-center rounded-xl",
                      sel ? "bg-white text-accent-ink" : "bg-bg text-ink-2",
                    )}
                  >
                    <CatalogIcon name={it.icon} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold break-words">{it.name}</span>
                    <span className="text-xs text-muted">
                      {!it.visible && <span className="font-semibold text-[#C53030]">Oculto · </span>}
                      {it.required && <span className="font-semibold text-accent-ink">Obligatorio · </span>}
                      <span className="2xl:hidden">
                        Mercado {fmt(it.minPrice)} – {fmt(it.maxPrice)}
                      </span>
                      <span className="max-2xl:hidden">{it.description}</span>
                    </span>
                  </span>
                </Link>
                <span className="hidden w-[150px] shrink-0 text-[13px] text-ink-2 2xl:block">
                  {fmt(it.minPrice)} – {fmt(it.maxPrice)}
                </span>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2 sm:ml-[50px] sm:gap-3 lg:ml-0 lg:flex-none lg:flex-nowrap lg:gap-4">
                  <span className="flex lg:w-[130px]">
                    <Link
                      href={`${base}&id=${it.id}`}
                      scroll={false}
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap tabular-nums"
                    >
                      {fmt(it.price)}
                      {it.unit === "MONTHLY" && <span className="font-normal text-muted">/mes</span>}
                      {it.unit === "EACH" && <span className="font-normal text-muted">c/u</span>}
                      <PencilLine size={12} className="text-muted" />
                    </Link>
                  </span>
                  <span className="flex items-center justify-center gap-1 lg:w-[60px]">
                    <MoveButtons id={it.id} name={it.name} first={index === 0} last={index === items.length - 1} />
                  </span>
                  <span className="flex w-[60px] shrink-0 justify-center">
                    <VisibleToggle id={it.id} visible={it.visible} name={it.name} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {form && <aside className="card sticky top-6 hidden w-[380px] shrink-0 p-[22px] xl:block">{form}</aside>}
      </div>
    </PageShell>
  );
}
