"use client";

import { BatteryFull, ChevronLeft, ChevronRight, Lock, PanelLeft, RotateCw, Signal, Wifi } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

// Device frames for the service previews. Each frame is drawn at its real size
// (a 1280 px wide macOS window, a 430 px wide iPhone) and then scaled down to fit,
// so the example inside keeps a true computer or phone layout on any screen.

export const MAC_SIZE = { width: 1280, height: 800 };
export const PHONE_SIZE = { width: 430, height: 884 };

/** Scales a fixed-size child down (never up) so it fits the available box. */
export function Fit({
  width,
  height,
  children,
  overlay,
}: {
  width: number;
  height: number;
  children: ReactNode;
  /** Drawn over the scaled frame at its real size (e.g. a close button that stays easy to tap). */
  overlay?: (scale: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = box.w && box.h ? Math.min(box.w / width, box.h / height, 1) : 0;

  return (
    <div ref={ref} className="relative grid min-h-0 w-full flex-1 place-items-center">
      <div
        className="relative transition-opacity duration-200"
        style={{ width: width * scale, height: height * scale, opacity: scale ? 1 : 0 }}
      >
        <div className="absolute top-0 left-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
          {children}
        </div>
        {scale > 0 && overlay?.(scale)}
      </div>
    </div>
  );
}

/** A macOS Safari-style window. The page inside scrolls. */
export function MacWindow({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[14px] bg-white ring-1 ring-black/10"
      style={{
        ...MAC_SIZE,
        boxShadow:
          "0 40px 90px -20px rgb(0 0 0 / 0.45), 0 18px 36px -18px rgb(0 0 0 / 0.35), inset 0 0 0 1px rgb(255 255 255 / 0.4)",
      }}
    >
      <div className="relative flex h-[52px] shrink-0 items-center gap-4 border-b border-black/[0.08] bg-[#F6F6F7] px-5">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#FF5F57] ring-1 ring-black/10 ring-inset" />
          <span className="size-3 rounded-full bg-[#FEBC2E] ring-1 ring-black/10 ring-inset" />
          <span className="size-3 rounded-full bg-[#28C840] ring-1 ring-black/10 ring-inset" />
        </div>
        <div className="ml-3 flex items-center gap-3 text-[#8E8E93]">
          <PanelLeft size={17} />
          <ChevronLeft size={19} />
          <ChevronRight size={19} className="opacity-40" />
        </div>
        <div className="absolute left-1/2 flex h-[32px] w-[440px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-lg bg-[#E9E9EB] text-[13px] text-[#3A3A3C]">
          <Lock size={11} strokeWidth={2.5} className="text-[#6E6E73]" />
          <span className="font-medium">{url}</span>
          <RotateCw size={12} className="absolute right-3 text-[#8E8E93]" />
        </div>
      </div>
      <div className="preview-scroll relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  );
}

/** An iPhone with Dynamic Island, side buttons and home indicator. The app inside scrolls. */
export function IPhone({
  children,
  statusBg = "#ffffff",
  statusLight,
  bare,
}: {
  children: ReactNode;
  statusBg?: string;
  statusLight?: boolean;
  /** Hide the signal / wifi / battery icons (room for a button). */
  bare?: boolean;
}) {
  return (
    <div className="relative" style={PHONE_SIZE}>
      {/* side buttons */}
      <span className="absolute top-[150px] -left-[3px] h-[30px] w-[4px] rounded-l-sm bg-[#2B2B30]" />
      <span className="absolute top-[205px] -left-[3px] h-[58px] w-[4px] rounded-l-sm bg-[#2B2B30]" />
      <span className="absolute top-[275px] -left-[3px] h-[58px] w-[4px] rounded-l-sm bg-[#2B2B30]" />
      <span className="absolute top-[230px] -right-[3px] h-[92px] w-[4px] rounded-r-sm bg-[#2B2B30]" />

      <div
        className="absolute inset-0 rounded-[70px] bg-[#111114] p-[13px]"
        style={{
          boxShadow:
            "0 0 0 2px #3C3C42, 0 0 0 3.5px #1A1A1E, 0 50px 90px -25px rgb(0 0 0 / 0.55), 0 25px 40px -20px rgb(0 0 0 / 0.4)",
        }}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[57px] bg-white">
          <StatusBar bg={statusBg} light={statusLight} bare={bare} />
          {/* Dynamic Island */}
          <span className="absolute top-[11px] left-1/2 z-30 h-[36px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
          <div className="preview-scroll no-scrollbar relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
          <span className="pointer-events-none absolute bottom-[8px] left-1/2 z-30 h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_0_0_1px_rgb(255_255_255/0.35)]" />
        </div>
      </div>
    </div>
  );
}

function StatusBar({ bg, light, bare }: { bg: string; light?: boolean; bare?: boolean }) {
  return (
    <div
      className={`relative z-20 flex h-[54px] shrink-0 items-center justify-between px-[34px] pt-[6px] text-[16px] font-semibold transition-colors ${light ? "text-white" : "text-black"}`}
      style={{ background: bg }}
    >
      <span className="w-[54px] text-center tracking-tight">9:41</span>
      {/* With `bare`, the right side is left free for the close button drawn over it. */}
      {!bare && (
        <span className="flex items-center gap-[6px]">
          <Signal size={17} strokeWidth={2.6} />
          <Wifi size={17} strokeWidth={2.6} />
          <BatteryFull size={24} strokeWidth={1.8} />
        </span>
      )}
    </div>
  );
}
