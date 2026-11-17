import type { BrowserContext, Page } from "@playwright/test";
import { createSessionToken, SESSION_COOKIE } from "../../src/lib/session";

/** Admin account created in the local test database by global-setup (never the real one). */
export const E2E_ADMIN = { email: "admin@prueba.test", password: "Prueba-E2E-2026" };

/** Logs the browser context in as the test admin by setting a valid session cookie. */
export async function loginAsAdmin(context: BrowserContext) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be in .env");
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: createSessionToken(E2E_ADMIN.email, secret),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

/** WhatsApp links open a new tab; tests read the URL instead of following it. */
export async function blockWhatsApp(page: Page) {
  await page.route("https://wa.me/**", (route) => route.abort());
  await page.context().route("https://wa.me/**", (route) => route.abort());
}

/** First href in the page matching a path prefix, e.g. "/admin/facturas/". */
export async function firstLink(page: Page, prefix: string) {
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  const id = hrefs.find((h) => /\/c[a-z0-9]{20,}/.test(h));
  if (!id) throw new Error(`No link starting with ${prefix}`);
  return id.split("?")[0].split("#")[0];
}

/**
 * Layout problems on the current page: horizontal page overflow, elements that
 * stick out of their box, siblings that overlap in a row, and clipped text.
 * Horizontal scrollers (filter chips) are allowed to overflow on purpose.
 */
export async function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    if (doc.scrollWidth > vw + 1) problems.push(`la página se sale ${doc.scrollWidth - vw}px a lo ancho`);

    const visible = (el: Element) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const inScroller = (el: Element) => {
      for (let p = el.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) return true;
      return false;
    };
    const floating = (el: Element) => ["absolute", "fixed"].includes(getComputedStyle(el).position);
    const label = (el: Element) =>
      ((el.getAttribute("aria-label") || (el as HTMLElement).innerText || el.tagName) ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 45);

    const all = [...document.querySelectorAll("body *")].filter(
      (el) => visible(el) && !el.closest("svg, nextjs-portal, script, style, [data-allow-overflow]"),
    );

    for (const el of all) {
      if (inScroller(el) || floating(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        problems.push(`fuera de la pantalla: "${label(el)}"`);
        continue;
      }
      const p = el.parentElement;
      if (!p || getComputedStyle(p).display === "inline" || el.tagName === "TD" || el.tagName === "TH") continue;
      const pr = p.getBoundingClientRect();
      if (pr.width > 0 && r.right > pr.right + 2)
        problems.push(`se sale de su caja (+${Math.round(r.right - pr.right)}px): "${label(el)}"`);
    }

    for (const el of all) {
      const s = getComputedStyle(el);
      if (!s.display.includes("flex") || s.flexDirection.startsWith("column")) continue;
      const kids = [...el.children].filter((k) => visible(k) && !floating(k));
      for (let i = 0; i < kids.length - 1; i++) {
        const a = kids[i].getBoundingClientRect();
        const b = kids[i + 1].getBoundingClientRect();
        const sameLine = a.bottom > b.top + 1 && b.bottom > a.top + 1;
        if (sameLine && a.right > b.left + 1) problems.push(`se encima "${label(kids[i])}" con "${label(kids[i + 1])}"`);
      }
    }

    for (const el of all) {
      const s = getComputedStyle(el);
      const clips = s.overflowX === "hidden" || s.overflowX === "clip";
      // Form fields scroll their own text, so they are not "cut".
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") continue;
      if (
        clips &&
        s.textOverflow !== "ellipsis" &&
        el.scrollWidth > el.clientWidth + 1 &&
        !inScroller(el) &&
        el.children.length === 0
      )
        problems.push(`texto cortado: "${label(el)}"`);
    }
    return [...new Set(problems)].slice(0, 25);
  });
}
