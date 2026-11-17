// Every amount in the app is US dollar cents. Pesos are only a display, using the
// current rate (pesos per US$1). Shared by server and client.

export type Currency = "USD" | "DOP";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const cents2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 125050 -> "US$1,250.50"; 50000 -> "US$500" (cents only when there are any). */
export function formatUSD(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(Math.round(cents));
  const body = abs % 100 === 0 ? whole.format(abs / 100) : cents2.format(abs / 100);
  return `${sign}US$${body}`;
}

/** Exact peso value of a dollar amount, rounded to whole pesos. */
export function toDOP(cents: number, rate: number): number {
  return Math.round((cents / 100) * rate);
}

/** 50000 at 61.10 -> "RD$30,550" */
export function formatDOP(cents: number, rate: number): string {
  const pesos = toDOP(cents, rate);
  const sign = pesos < 0 ? "−" : "";
  return `${sign}RD$${whole.format(Math.abs(pesos))}`;
}

export function formatIn(currency: Currency, cents: number, rate: number): string {
  return currency === "USD" ? formatUSD(cents) : formatDOP(cents, rate);
}

/** Whole dollars, for ranges: 50000 -> "US$500". */
export function formatUSDShort(cents: number): string {
  return `US$${whole.format(Math.round(cents / 100))}`;
}

/** "1,250.5" / "1250" / "US$ 1,250.50" -> cents. Empty or invalid -> 0. */
export function parseUSD(input: string): number {
  const clean = input.replace(/[^\d.]/g, "");
  if (!clean) return 0;
  const [int, dec = ""] = clean.split(".");
  return Number(int || 0) * 100 + Number((dec + "00").slice(0, 2));
}

/** cents -> text for an input: 125050 -> "1,250.50", 50000 -> "500". */
export function centsToInput(cents: number): string {
  if (!cents) return "";
  return cents % 100 === 0 ? whole.format(cents / 100) : cents2.format(cents / 100);
}

/** "61.10" style rate for labels. */
export function formatRate(rate: number): string {
  return rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
