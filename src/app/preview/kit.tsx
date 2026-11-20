"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCheck, ChevronLeft, Mic, Paperclip, Phone, Search, Smile, Video } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

// Small building blocks shared by the preview examples. Everything here is drawn
// with CSS and icons (no external images), so the previews load instantly.

const TONES = {
  coffee: "from-[#D9B48F] via-[#9A6644] to-[#4A2A1A]",
  cream: "from-[#FBF1E4] via-[#EBD3B4] to-[#C99E70]",
  sage: "from-[#E1EBDD] via-[#A9C3A5] to-[#5E8566]",
  sky: "from-[#DCEBFF] via-[#93BAF5] to-[#3F74D8]",
  rose: "from-[#FFE3E8] via-[#F2A9B8] to-[#C65A77]",
  sand: "from-[#F5EDE0] via-[#DCC6A4] to-[#A88660]",
  ink: "from-[#4B4F58] via-[#25272D] to-[#0E0F12]",
  lilac: "from-[#EEE8FF] via-[#BFAEF5] to-[#6F55D6]",
  teal: "from-[#D9F3EF] via-[#86D1C5] to-[#1E8C7E]",
  sun: "from-[#FFF3D6] via-[#FFD27A] to-[#F08A24]",
} as const;

export type Tone = keyof typeof TONES;

/** A photo placeholder: soft gradient, light shapes and an optional icon. */
export function Photo({
  tone = "coffee",
  icon: Icon,
  className,
  iconSize = 40,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={cx(!className?.includes("absolute") && "relative", "overflow-hidden bg-linear-to-br", TONES[tone], className)}
    >
      <span className="absolute -right-[12%] -bottom-[25%] aspect-square w-[60%] rounded-full bg-white/15" />
      <span className="absolute top-[12%] left-[10%] aspect-square w-[35%] rounded-full bg-white/20 blur-2xl" />
      <span className="absolute -top-[20%] right-[25%] aspect-square w-[30%] rounded-full bg-black/5" />
      {Icon && <Icon className="absolute inset-0 m-auto text-white/75 drop-shadow-sm" size={iconSize} strokeWidth={1.4} />}
    </div>
  );
}

/** Gray line used as filler text. */
export function Bar({ w = "100%", className }: { w?: string; className?: string }) {
  return <span className={cx("block h-2 rounded-full bg-black/[0.07]", className)} style={{ width: w }} />;
}

export function Stars({ n = 5, size = 13, className }: { n?: number; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex gap-0.5 text-[#F5A623]", className)} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** A decorative QR-like pattern (deterministic, not scannable). */
export function FakeQr({ size = 120, className }: { size?: number; className?: string }) {
  const n = 21;
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < n * n; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => {
    for (const [fx, fy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return edge || core;
      }
    }
    return false;
  };
  const c = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const fill = finder(x, y) ? finderOn(x, y) : on;
        return fill ? <rect key={i} x={x * c} y={y * c} width={c + 0.3} height={c + 0.3} fill="#111" /> : null;
      })}
    </svg>
  );
}

/** Small round logo with an icon, used as each example brand's mark. */
export function Logo({
  icon: Icon,
  name,
  color,
  className,
  light,
}: {
  icon: LucideIcon;
  name: string;
  color: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cx("flex items-center gap-2 font-bold tracking-[-0.02em]", className)}>
      <span className="grid size-8 place-items-center rounded-[10px] text-white" style={{ background: color }}>
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <span className={light ? "text-white" : undefined}>{name}</span>
    </span>
  );
}

export type ChatMessage = {
  from: "me" | "them";
  text?: ReactNode;
  card?: ReactNode;
  time: string;
};

/** A messaging app conversation (generic, WhatsApp-like colors). */
export function ChatThread({
  title,
  subtitle,
  avatar,
  messages,
  m,
  header = "#0F6E5F",
}: {
  title: string;
  subtitle: string;
  avatar: ReactNode;
  messages: ChatMessage[];
  m: boolean;
  header?: string;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#EFE9E1]">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 text-white" style={{ background: header }}>
        {m && <ChevronLeft size={22} className="-ml-1" />}
        {avatar}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold">{title}</span>
          <span className="truncate text-[12px] text-white/75">{subtitle}</span>
        </div>
        <Video size={20} className="opacity-90" />
        <Phone size={18} className="ml-3 opacity-90" />
      </div>
      <div
        className="flex flex-1 flex-col gap-2 px-3 py-4"
        style={{
          backgroundImage: "radial-gradient(rgb(0 0 0 / 0.045) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <span className="mx-auto mb-1 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#54656F] shadow-sm">
          Hoy
        </span>
        {messages.map((msg, i) => (
          <div key={i} className={cx("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
            <div
              className={cx(
                "relative flex max-w-[80%] flex-col gap-1.5 rounded-xl px-2.5 pt-1.5 pb-1 text-[14px] leading-snug text-[#111B21] shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]",
                msg.from === "me" ? "rounded-tr-sm bg-[#D9FDD3]" : "rounded-tl-sm bg-white",
              )}
            >
              {msg.card}
              {msg.text && <span className="pr-12 whitespace-pre-line">{msg.text}</span>}
              <span className="-mt-3.5 flex items-center justify-end gap-1 self-end text-[10.5px] text-[#667781]">
                {msg.time}
                {msg.from === "me" && <CheckCheck size={14} className="text-[#53BDEB]" />}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 flex items-center gap-2 bg-[#F0F2F5] px-3 py-2.5 pb-6">
        <span className="flex h-10 flex-1 items-center gap-3 rounded-full bg-white px-3.5 text-[14px] text-[#8696A0]">
          <Smile size={20} />
          Mensaje
          <Paperclip size={19} className="ml-auto" />
        </span>
        <span className="grid size-10 place-items-center rounded-full text-white" style={{ background: header }}>
          <Mic size={18} />
        </span>
      </div>
    </div>
  );
}

/** Left list of conversations, for the computer version of chat examples. */
export function ChatList({
  items,
  title = "Chats",
}: {
  items: { name: string; last: string; time: string; unread?: number; tag?: string; tone: Tone; active?: boolean }[];
  title?: string;
}) {
  return (
    <div className="flex w-[360px] shrink-0 flex-col border-r border-black/10 bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-[22px] font-bold tracking-[-0.02em]">{title}</span>
      </div>
      <div className="mx-4 mb-2 flex h-9 items-center gap-2 rounded-lg bg-[#F0F2F5] px-3 text-[13px] text-[#667781]">
        <Search size={15} /> Buscar o empezar un chat
      </div>
      {items.map((c) => (
        <div key={c.name} className={cx("flex items-center gap-3 px-4 py-3", c.active && "bg-[#F0F2F5]")}>
          <Photo tone={c.tone} className="size-12 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-b border-black/5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[15px] font-medium">{c.name}</span>
              <span className={cx("text-[11px]", c.unread ? "font-semibold text-[#1FA855]" : "text-[#667781]")}>{c.time}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[13px] text-[#667781]">
                {c.tag && <b className="mr-1 font-semibold text-[#0F6E5F]">{c.tag}</b>}
                {c.last}
              </span>
              {c.unread ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#1FA855] px-1 text-[11px] font-bold text-white">
                  {c.unread}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export type NavItem = { icon: LucideIcon; label: string };

/**
 * Layout for system-like examples: a sidebar on the computer, a top bar and a bottom
 * tab bar on the phone.
 */
export function AppShell({
  m,
  brand,
  nav,
  active = 0,
  accent,
  title,
  actions,
  children,
  dark,
}: {
  m: boolean;
  brand: ReactNode;
  nav: NavItem[];
  active?: number;
  accent: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  dark?: boolean;
}) {
  if (m)
    return (
      <div className="flex min-h-full flex-col bg-[#F5F6F8]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-5 py-3 backdrop-blur">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#8A8F98]">{brand}</span>
            <span className="text-[22px] font-bold tracking-[-0.03em]">{title}</span>
          </div>
          {actions}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 pb-6">{children}</div>
        <div className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-black/5 bg-white/95 px-2 pt-2 pb-7 backdrop-blur">
          {nav.slice(0, 4).map((n, i) => (
            <span
              key={n.label}
              className="flex flex-col items-center gap-1 text-[10.5px] font-medium"
              style={{ color: i === active ? accent : "#9DA1A8" }}
            >
              <n.icon size={22} strokeWidth={i === active ? 2.3 : 1.8} />
              {n.label}
            </span>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex min-h-full bg-[#F5F6F8]">
      <aside
        className={cx(
          "sticky top-0 flex h-[748px] w-[232px] shrink-0 flex-col gap-1 px-4 py-5",
          dark ? "bg-[#111317] text-white" : "border-r border-black/5 bg-white",
        )}
      >
        <div className="mb-5 px-2">{brand}</div>
        {nav.map((n, i) => (
          <span
            key={n.label}
            className={cx(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium",
              i === active ? "text-white" : dark ? "text-white/60" : "text-[#5B6070]",
            )}
            style={i === active ? { background: accent } : undefined}
          >
            <n.icon size={18} />
            {n.label}
          </span>
        ))}
        <div className={cx("mt-auto flex items-center gap-3 rounded-xl p-2", dark ? "bg-white/5" : "bg-[#F5F6F8]")}>
          <Photo tone="lilac" className="size-9 rounded-full" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Ana Rodríguez</span>
            <span className={cx("text-[11px]", dark ? "text-white/50" : "text-[#8A8F98]")}>Administradora</span>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-black/5 bg-white px-7">
          <span className="text-[22px] font-bold tracking-[-0.03em]">{title}</span>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-[240px] items-center gap-2 rounded-lg bg-[#F5F6F8] px-3 text-[13px] text-[#8A8F98]">
              <Search size={15} /> Buscar…
            </span>
            {actions}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-7">{children}</div>
      </main>
    </div>
  );
}

/** A KPI tile. */
export function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  color,
  m,
  bad,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  color: string;
  m?: boolean;
  bad?: boolean;
}) {
  return (
    <div className={cx("flex flex-col gap-2 rounded-2xl bg-white shadow-[0_6px_20px_rgb(14_15_18/0.05)]", m ? "p-3.5" : "p-5")}>
      <div className="flex items-center justify-between">
        <span className={cx("font-medium text-[#8A8F98]", m ? "text-[12px]" : "text-[13px]")}>{label}</span>
        <span className="grid size-8 place-items-center rounded-lg" style={{ background: `${color}1A`, color }}>
          <Icon size={16} />
        </span>
      </div>
      <span className={cx("font-bold tracking-[-0.03em]", m ? "text-[22px]" : "text-[28px]")}>{value}</span>
      {delta && <span className={cx("text-[12px] font-semibold", bad ? "text-[#D64545]" : "text-[#1E8A4C]")}>{delta}</span>}
    </div>
  );
}

export function Pill({ children, color }: { children: ReactNode; color: "green" | "red" | "amber" | "blue" | "gray" }) {
  const c = {
    green: "bg-[#E9F8EF] text-[#1E8A4C]",
    red: "bg-[#FDEDED] text-[#C53030]",
    amber: "bg-[#FFF4DD] text-[#A86A00]",
    blue: "bg-[#EAF2FE] text-[#2C6FD8]",
    gray: "bg-[#F1F2F4] text-[#5B6070]",
  }[color];
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", c)}>{children}</span>
  );
}
