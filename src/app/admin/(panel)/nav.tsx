"use client";

import { Copy, FileText, House, Layers, Plus, ReceiptText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminCurrencySwitch } from "@/components/money";
import { ProfilePhoto } from "@/components/profile-photo";
import { cx } from "@/components/ui";

const ITEMS = [
  { href: "/admin", label: "Inicio", icon: House },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/admin/facturas", label: "Facturas", icon: ReceiptText },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/catalogo", label: "Catálogo", icon: Layers },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

function useActive() {
  const path = usePathname();
  return (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
}

/** Desktop: full sidebar from xl; icon rail on iPad landscape (lg). */
export function Sidebar({ ownerName, publicUrl, newCount }: { ownerName: string; publicUrl: string; newCount: number }) {
  const isActive = useActive();
  const [copied, setCopied] = useState(false);
  return (
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col gap-7 border-r border-line bg-surface px-[18px] py-7 lg:flex xl:w-[248px]">
      <div className="flex items-center gap-3 xl:px-1.5">
        <ProfilePhoto size={40} priority />
        <span className="hidden flex-col xl:flex">
          <span className="font-bold">Cotizador</span>
          <span className="text-xs text-muted">{ownerName}</span>
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[15px] transition-colors",
                active ? "bg-accent-soft font-semibold text-accent-ink" : "font-medium text-ink-2 hover:bg-bg",
              )}
            >
              <span className="relative">
                <Icon size={20} className={active ? "text-accent-ink" : "text-[#6B7079]"} />
                {href === "/admin/cotizaciones" && newCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-2.5 rounded-full bg-accent ring-2 ring-white xl:hidden" />
                )}
              </span>
              <span className="hidden flex-1 xl:inline">{label}</span>
              {href === "/admin/cotizaciones" && newCount > 0 && (
                <span
                  className="hidden rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white xl:inline"
                  title="Propuestas nuevas"
                >
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden flex-col gap-1.5 px-1.5 xl:flex">
        <span className="text-xs font-medium text-muted">Ver montos en</span>
        <AdminCurrencySwitch />
      </div>
      <div className="hidden flex-col gap-2.5 rounded-[20px] bg-ink p-4 xl:flex">
        <span className="text-sm font-semibold text-white">Tu cotizador público</span>
        <a href="/" target="_blank" className="truncate text-xs text-[#8DBBFF] hover:underline">
          {publicUrl.replace(/^https?:\/\//, "")}
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
        >
          <Copy size={14} /> {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
    </aside>
  );
}

/** Phone and iPad portrait: black pill + blue "+" (like the reference). */
export function BottomNav({ newCount }: { newCount: number }) {
  const isActive = useActive();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2.5 px-4 pb-5 lg:hidden">
      <nav className="flex w-full max-w-[340px] items-center justify-between gap-1 rounded-full bg-ink p-1 shadow-float">
        {ITEMS.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cx(
                "grid h-10 flex-1 place-items-center rounded-full transition-colors",
                active ? "bg-white text-ink" : "text-nav-idle hover:text-white",
              )}
            >
              <span className="relative">
                <Icon size={19} />
                {href === "/admin/cotizaciones" && newCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {newCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/admin/cotizaciones/nueva"
        aria-label="Nueva cotización"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-white"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
