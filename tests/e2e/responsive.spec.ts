import { expect, type Page, test } from "@playwright/test";
import { firstLink, layoutProblems, loginAsAdmin } from "./helpers";

// Phones, tablets (portrait and landscape) and desktops.
const WIDTHS = [320, 360, 375, 390, 414, 768, 834, 1024, 1194, 1280, 1440, 1920];

async function check(page: Page, what: string, report: string[]) {
  await page.waitForLoadState("networkidle");
  for (const p of await layoutProblems(page)) report.push(`${what}: ${p}`);
}

for (const width of WIDTHS) {
  test(`nada se sale de su sitio a ${width}px`, async ({ page, context }) => {
    test.setTimeout(240_000); // visits ~20 pages
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    const report: string[] = [];

    // Public quote builder, every step
    await page.goto("/");
    await check(page, "cotizador · paso 1", report);
    await page.getByRole("button", { name: /Página web/ }).click();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await check(page, "cotizador · US$", report);
    await page.getByRole("button", { name: /^RD\$$/ }).click();
    if (width < 1024) await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    for (const name of [
      "Reservas y citas",
      "Notificaciones por WhatsApp",
      "Dominio + hosting (1er año)",
      "Mantenimiento mensual",
    ])
      await page.getByRole("switch", { name }).click();
    await check(page, "cotizador · extras", report);
    if (width < 1024) await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: /Urgente/ }).click();
    await check(page, "cotizador · datos", report);

    await page.goto("/admin/login");
    await check(page, "login", report);

    // Admin
    await loginAsAdmin(context);
    const pages = [
      "/admin",
      "/admin/cotizaciones",
      "/admin/facturas",
      "/admin/clientes",
      "/admin/catalogo",
      "/admin/catalogo?tipo=extras",
      "/admin/catalogo?tipo=proyectos&nuevo=1",
      "/admin/ajustes",
      "/admin/cotizaciones/nueva",
      "/admin/facturas/nueva",
      "/admin/clientes/nuevo",
    ];
    for (const url of pages) {
      await page.goto(url);
      await check(page, url, report);
    }
    for (const [list, prefix] of [
      ["/admin/cotizaciones", "/admin/cotizaciones/"],
      ["/admin/facturas", "/admin/facturas/"],
      ["/admin/clientes", "/admin/clientes/"],
    ]) {
      await page.goto(list);
      const href = await firstLink(page, prefix);
      await page.goto(href);
      await check(page, href.replace(/c[a-z0-9]{20,}/, "[id]"), report);
      if (prefix === "/admin/facturas/") {
        await page.goto(`${href}/editar`);
        await check(page, "/admin/facturas/[id]/editar", report);
      }
    }

    expect(report, report.join("\n")).toEqual([]);
  });
}
