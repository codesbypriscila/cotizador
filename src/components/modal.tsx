"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Centered dialog with a dimmed background. Escape and the background close it
 * (unless `locked`, e.g. while saving). Focus moves into the dialog when it opens.
 */
export function Modal({
  title,
  children,
  onClose,
  locked,
  icon,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  locked?: boolean;
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !locked && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [locked, onClose]);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" onClick={() => !locked && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-5 shadow-float"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {icon}
          <h2 id="modal-title" className="text-lg font-bold tracking-[-0.02em]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
