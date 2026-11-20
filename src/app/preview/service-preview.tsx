"use client";

import { Monitor, Smartphone, X } from "lucide-react";
import { type CSSProperties, type Ref, useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";
import { Fit, IPhone, MAC_SIZE, MacWindow, PHONE_SIZE } from "./frames";
import { previewFor } from "./registry";

export type Device = "desktop" | "mobile";

export type PreviewItem = {
  name: string;
  description: string;
  kind: "PROJECT" | "EXTRA";
};

/**
 * Pop-out with an example of a service: only the device (a macOS window or an iPhone)
 * floating over the page, two icons to switch between them and an X to close.
 */
export function ServicePreview({ item, onClose }: { item: PreviewItem; onClose: () => void }) {
  // Start with the device the client is using.
  const [device, setDevice] = useState<Device>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
  );
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const def = previewFor(item);
  const { Mock } = def;

  const close = () => {
    setClosing(true);
    window.setTimeout(onClose, 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") setDevice("desktop");
      if (e.key === "ArrowRight") setDevice("mobile");
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => closeRef.current?.focus()));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ejemplo de ${item.name}`}
      onClick={close}
      className={cx(
        "fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-[3px]",
        closing ? "preview-backdrop-out" : "preview-backdrop-in",
      )}
    >
      {/* Controls: computer / phone, and close */}
      <div className="relative flex shrink-0 items-center justify-center px-4 pt-4 md:pt-6" onClick={(e) => e.stopPropagation()}>
        <div
          role="radiogroup"
          aria-label="Ver en"
          className="relative flex rounded-full bg-white/90 p-1 shadow-[0_8px_30px_rgb(0_0_0/0.25)] backdrop-blur"
        >
          <span
            aria-hidden
            className={cx(
              "absolute top-1 bottom-1 left-1 w-12 rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(.3,1.3,.5,1)]",
              device === "mobile" && "translate-x-12",
            )}
          />
          {(
            [
              ["desktop", Monitor, "Ver en computadora"],
              ["mobile", Smartphone, "Ver en celular"],
            ] as const
          ).map(([d, Icon, label]) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={device === d}
              aria-label={label}
              title={label}
              onClick={() => setDevice(d)}
              className={cx(
                "relative z-10 grid h-10 w-12 place-items-center rounded-full transition-colors",
                device === d ? "text-white" : "text-ink-2 hover:text-ink",
              )}
            >
              <Icon size={19} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* The device. Clicking around it closes; clicking on it does not. */}
      <div className="flex min-h-0 flex-1 flex-col px-3 pt-4 pb-6 md:px-10 md:pt-5 md:pb-10">
        <div key={device} className={cx("flex min-h-0 flex-1 flex-col", closing ? "preview-sheet-out" : "preview-device-in")}>
          {device === "desktop" ? (
            <Fit
              {...MAC_SIZE}
              overlay={(scale) => {
                // Centered in the window's title bar, on the right.
                const size = Math.round(Math.max(26, Math.min(32, 40 * scale)));
                return (
                  <CloseButton
                    ref={closeRef}
                    onClose={close}
                    size={size}
                    tone="light"
                    style={{ top: Math.max(4, 26 * scale - size / 2), right: Math.max(6, 16 * scale) }}
                  />
                );
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <MacWindow url={def.url}>
                  <Mock m={false} />
                </MacWindow>
              </div>
            </Fit>
          ) : (
            <Fit
              {...PHONE_SIZE}
              overlay={(scale) => {
                // In the iPhone's status bar, on the right (where the battery icons go).
                const size = Math.round(Math.max(26, Math.min(32, 34 * scale)));
                return (
                  <CloseButton
                    ref={closeRef}
                    onClose={close}
                    size={size}
                    tone={def.phoneTopLight ? "dark" : "light"}
                    style={{ top: 43 * scale - size / 2, right: 42 * scale }}
                  />
                );
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <IPhone statusBg={def.phoneTop} statusLight={def.phoneTopLight} bare>
                  <Mock m />
                </IPhone>
              </div>
            </Fit>
          )}
        </div>
      </div>
    </div>
  );
}

/** The X inside the example (Mac title bar or iPhone screen). */
function CloseButton({
  ref,
  onClose,
  size,
  tone,
  style,
}: {
  ref: Ref<HTMLButtonElement>;
  onClose: () => void;
  size: number;
  tone: "light" | "dark";
  style: CSSProperties;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      aria-label="Cerrar"
      title="Cerrar"
      className={cx(
        "absolute z-20 grid place-items-center rounded-full backdrop-blur transition-colors",
        tone === "light" ? "bg-black/[0.07] text-[#3A3A3C] hover:bg-black/[0.13]" : "bg-white/20 text-white hover:bg-white/30",
      )}
      style={{ ...style, width: size, height: size }}
    >
      <X size={Math.round(size * 0.55)} strokeWidth={2.4} />
    </button>
  );
}
