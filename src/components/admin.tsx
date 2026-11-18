import { ChevronLeft, Hash, type LucideIcon, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { DocStatus } from "@/lib/totals";
import { cx, StatusBadge } from "./ui";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cx(
        "mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-4 md:px-8 lg:gap-5 lg:px-10 lg:pt-8 lg:pb-10",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  count,
  subtitle,
  actions,
  back,
}: {
  title: string;
  count?: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: string;
}) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2.5">
        {back && (
          <span className="lg:hidden">
            <BackButton href={back} />
          </span>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <h1 className="text-2xl leading-none font-bold tracking-[-0.03em] lg:text-[28px]">{title}</h1>
            {count && <span className="text-[13px] text-muted">{count}</span>}
          </div>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function BackButton({ href, label = "Atrás" }: { href: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
      <ChevronLeft size={18} />
    </Link>
  );
}

/** GET search form that keeps the current filter. */
export function SearchBox({
  placeholder,
  q,
  hidden,
  className,
}: {
  placeholder: string;
  q?: string;
  hidden?: Record<string, string | undefined>;
  className?: string;
}) {
  return (
    <form role="search" className={cx("flex h-11 items-center gap-2 rounded-full bg-surface px-4 shadow-card", className)}>
      <Search size={17} className="shrink-0 text-muted" />
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-base outline-none placeholder:text-muted lg:text-[15px]"
      />
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
    </form>
  );
}

export function FilterChips({
  options,
  active,
  hrefFor,
}: {
  options: { value: string; label: string }[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <nav
      data-allow-overflow
      className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0"
      aria-label="Filtrar"
    >
      {options.map((o) => (
        <Link
          key={o.value}
          href={hrefFor(o.value)}
          scroll={false}
          aria-current={o.value === active ? "true" : undefined}
          className={cx(
            "flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] whitespace-nowrap transition-colors lg:h-9 lg:px-4 lg:text-sm",
            o.value === active ? "bg-accent font-medium text-white" : "bg-chip text-[#6B7079] hover:bg-[#E3E5E9]",
          )}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

/** The invoice-style card from the reference design. */
export function DocCard({
  href,
  icon: Icon,
  title,
  subtitle,
  amount,
  number,
  numberIcon: NumberIcon = Hash,
  status,
  date,
  highlight,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  amount: string;
  number: string;
  numberIcon?: LucideIcon;
  status?: DocStatus;
  date: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "card flex gap-2.5 rounded-2xl border-[1.5px] px-3 py-2.5 transition-shadow lg:gap-3 lg:rounded-[20px] lg:p-4 hover:shadow-[0_10px_32px_rgb(14_15_18/0.09)]",
        highlight ? "border-accent" : "border-transparent",
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bg text-ink-2 lg:size-9">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-[13px] font-semibold break-words lg:text-sm">{title}</span>
          <span className="text-[13px] font-semibold whitespace-nowrap tabular-nums lg:text-sm">{amount}</span>
        </span>
        <span className="truncate text-xs text-muted lg:text-[13px]">{subtitle}</span>
        <span className="my-2 hidden h-px bg-line lg:block" />
        <span className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 lg:mt-0">
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-2 lg:text-xs">
            <NumberIcon size={12} className="shrink-0 text-muted" />
            <span className="truncate">{number}</span>
            {status && <StatusBadge status={status} size="sm" />}
          </span>
          <span className="text-[11px] whitespace-nowrap text-muted lg:text-xs">{date}</span>
        </span>
      </span>
    </Link>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2.5 px-6 py-9 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-bg text-muted">
        <Icon size={22} />
      </span>
      <p className="font-semibold">{title}</p>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <h2 className="text-base font-bold tracking-[-0.01em] lg:text-lg">{children}</h2>
      {action}
    </div>
  );
}
