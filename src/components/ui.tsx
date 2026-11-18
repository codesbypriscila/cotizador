import type { ComponentProps } from "react";
import { avatarTone, initials } from "@/lib/format";
import { type DocStatus, STATUS_LABEL } from "@/lib/totals";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const BADGE: Record<DocStatus, string> = {
  DRAFT: "bg-[#F1F2F4] border-[#E2E4E8] text-[#5B6070]",
  SENT: "bg-[#FFF8DD] border-[#F6E3A0] text-[#9A7400]",
  PARTIAL: "bg-[#EAF2FE] border-[#C9DDFB] text-[#2C6FD8]",
  PAID: "bg-[#E9F8EF] border-[#BDE7CD] text-[#1E8A4C]",
  OVERDUE: "bg-[#FDEDED] border-[#F5C6C6] text-[#C53030]",
  ACCEPTED: "bg-[#E9F8EF] border-[#BDE7CD] text-[#1E8A4C]",
  REJECTED: "bg-[#F1F2F4] border-[#E2E4E8] text-[#8A8F98]",
};

export function StatusBadge({ status, className, size }: { status: DocStatus; className?: string; size?: "sm" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-px text-[10px] lg:px-2.5 lg:py-0.5 lg:text-xs" : "px-2.5 py-0.5 text-xs",
        BADGE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Avatar({ name, size = 44, className }: { name: string; size?: number; className?: string }) {
  const tone = avatarTone(name);
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded-full font-bold", className)}
      style={{ width: size, height: size, background: tone.bg, color: tone.fg, fontSize: size * 0.32 }}
    >
      {initials(name)}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  name?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cx("relative h-7 w-12 shrink-0 rounded-full p-[3px] transition-colors", checked ? "bg-accent" : "bg-[#E1E3E7]")}
    >
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
      <span
        className={cx("block size-[22px] rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-5")}
      />
    </button>
  );
}

export function Chip({ active, className, ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "h-9 shrink-0 rounded-full px-4 text-sm whitespace-nowrap transition-colors",
        active ? "bg-accent font-medium text-white" : "bg-chip text-[#6B7079] hover:bg-[#E3E5E9]",
        className,
      )}
      {...props}
    />
  );
}

type ButtonVariant = "primary" | "dark" | "soft" | "outline" | "danger";
const BUTTON: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-[#3D83EC]",
  dark: "bg-ink text-white hover:bg-[#23252B]",
  soft: "bg-chip text-ink hover:bg-[#E3E5E9]",
  outline: "border border-[#D5D8DE] text-ink hover:bg-white",
  danger: "bg-[#FDEDED] text-[#C53030] hover:bg-[#FBE0E0]",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cx(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors disabled:opacity-60",
    BUTTON[variant],
    className,
  );
}

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export const inputClass =
  "h-11 w-full rounded-xl bg-bg px-3.5 text-base lg:text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40";

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}
