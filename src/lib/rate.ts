import "server-only";
import { prisma } from "./prisma";

// Pesos per US$1, refreshed from a public exchange API at most every 6 hours.
// If every source fails we keep the last known rate and retry in 30 minutes.

export const RATE_MAX_AGE = 6 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE = 30 * 60 * 1000;

const SOURCES: { name: string; url: string; pick: (json: unknown) => unknown }[] = [
  {
    name: "open.er-api.com",
    url: "https://open.er-api.com/v6/latest/USD",
    pick: (j) => (j as { rates?: { DOP?: unknown } }).rates?.DOP,
  },
  {
    name: "fawazahmed0/currency-api",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    pick: (j) => (j as { usd?: { dop?: unknown } }).usd?.dop,
  },
];

async function fetchRate(): Promise<{ rate: number; source: string } | null> {
  for (const s of SOURCES) {
    try {
      const res = await fetch(s.url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const value = s.pick(await res.json());
      // Sanity range so a broken response never reaches the quotes.
      if (typeof value === "number" && value > 30 && value < 200) return { rate: value, source: s.name };
    } catch {
      // try the next source
    }
  }
  return null;
}

export type RateInfo = { rate: number; updatedAt: Date | null; source: string };

/** Current rate. Refreshes it first when it is older than 6 hours (or `force`). */
export async function getRate({ force = false } = {}): Promise<RateInfo> {
  const s = await prisma.settings.findUnique({
    where: { id: 1 },
    select: { dopRate: true, rateUpdatedAt: true, rateCheckedAt: true, rateSource: true },
  });
  if (!s) return { rate: 60, updatedAt: null, source: "" };

  const now = Date.now();
  const stale = !s.rateUpdatedAt || now - s.rateUpdatedAt.getTime() > RATE_MAX_AGE;
  const recentlyFailed = s.rateCheckedAt && now - s.rateCheckedAt.getTime() < RETRY_AFTER_FAILURE;
  if (!force && (!stale || recentlyFailed)) {
    return { rate: s.dopRate, updatedAt: s.rateUpdatedAt, source: s.rateSource };
  }

  const fresh = await fetchRate();
  const checkedAt = new Date();
  if (!fresh) {
    await prisma.settings.update({ where: { id: 1 }, data: { rateCheckedAt: checkedAt } });
    return { rate: s.dopRate, updatedAt: s.rateUpdatedAt, source: s.rateSource };
  }
  await prisma.settings.update({
    where: { id: 1 },
    data: { dopRate: fresh.rate, rateUpdatedAt: checkedAt, rateCheckedAt: checkedAt, rateSource: fresh.source },
  });
  return { rate: fresh.rate, updatedAt: checkedAt, source: fresh.source };
}
