"use client";

import { useState, useTransition } from "react";
import { cx } from "./ui";

/**
 * Two-step destructive action: the first click asks inline, the second runs it.
 * Replaces the browser's confirm() so it looks the same on every device.
 */
export function ConfirmButton({
  children,
  question,
  confirmLabel = "Sí, borrar",
  onConfirm,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  question: string;
  confirmLabel?: string;
  onConfirm: () => unknown;
  className?: string;
  ariaLabel?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();

  if (!asking) {
    return (
      <button type="button" aria-label={ariaLabel} onClick={() => setAsking(true)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <span
      role="alertdialog"
      aria-label={question}
      className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#FDEDED] px-3 py-2"
    >
      <span className="text-[13px] font-medium text-[#8A2323]">{question}</span>
      <button
        type="button"
        autoFocus
        disabled={pending}
        onClick={() => start(async () => void (await onConfirm()))}
        className={cx("rounded-full bg-[#C53030] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60")}
      >
        {pending ? "Borrando…" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink"
      >
        Cancelar
      </button>
    </span>
  );
}
