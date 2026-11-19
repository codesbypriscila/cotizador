import "server-only";
import { cookies } from "next/headers";
import { type Currency, formatIn } from "./money";
import { getRate } from "./rate";

export const ADMIN_CURRENCY_COOKIE = "admin_moneda";

/** The admin's chosen display currency (US$ by default) and a formatter for it. */
export async function getAdminMoney() {
  const [jar, rate] = await Promise.all([cookies(), getRate()]);
  const currency: Currency = jar.get(ADMIN_CURRENCY_COOKIE)?.value === "DOP" ? "DOP" : "USD";
  return { currency, rate: rate.rate, fmt: (cents: number) => formatIn(currency, cents, rate.rate) };
}
