"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useTransition } from "react";
import { cx } from "@/components/ui";
import { type Currency, formatIn } from "@/lib/money";
import { setAdminCurrency } from "@/app/admin/actions";

// The admin chooses to see amounts in US$ or RD$ (amounts are always stored and typed in US$).

const MoneyContext = createContext<{ currency: Currency; rate: number }>({ currency: "USD", rate: 60 });

export function MoneyProvider({ currency, rate, children }: { currency: Currency; rate: number; children: ReactNode }) {
  return <MoneyContext.Provider value={{ currency, rate }}>{children}</MoneyContext.Provider>;
}

/** Formatter for the admin's chosen currency. */
export function useMoney() {
  const { currency, rate } = useContext(MoneyContext);
  return useCallback((cents: number) => formatIn(currency, cents, rate), [currency, rate]);
}

export function useAdminCurrency(): Currency {
  return useContext(MoneyContext).currency;
}

/** An amount in the admin's chosen currency. */
export function Money({ cents, suffix = "" }: { cents: number; suffix?: string }) {
  const fmt = useMoney();
  return (
    <>
      {fmt(cents)}
      {suffix}
    </>
  );
}

/** US$ / RD$ switch for the whole admin. */
export function AdminCurrencySwitch({ className }: { className?: string }) {
  const { currency } = useContext(MoneyContext);
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div
      role="group"
      aria-label="Ver montos en"
      className={cx("flex w-fit rounded-full bg-chip p-[3px]", pending && "opacity-60", className)}
    >
      {(
        [
          ["USD", "US$"],
          ["DOP", "RD$"],
        ] as const
      ).map(([c, label]) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() =>
            start(async () => {
              await setAdminCurrency(c);
              router.refresh();
            })
          }
          className={cx(
            "rounded-full px-2.5 py-1 text-xs",
            currency === c ? "bg-surface font-semibold text-ink shadow-sm" : "font-medium text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
