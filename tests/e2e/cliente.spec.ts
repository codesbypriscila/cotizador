import { expect, type Page, test } from "@playwright/test";
import { blockWhatsApp, loginAsAdmin } from "./helpers";

const money = (s: string) => Number(s.replace(/[^\d.]/g, ""));

async function rateShown(page: Page) {
  const text = await page
    .getByText(/US\$1 = RD\$[\d.]+/)
    .filter({ visible: true })
    .first()
    .innerText();
  return Number(text.match(/US\$1 = RD\$([\d.]+)/)![1]);
}

test.describe("cliente en computadora", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("arma su proyecto, ve el total en las dos monedas y envía por WhatsApp", async ({ page, context }) => {
    await blockWhatsApp(page);
    await page.goto("/");
    await expect(page.getByText("Desarrolladora de Software")).toBeVisible();
    await expect(page.getByAltText("Priscila Pérez")).toBeVisible();

    // Nothing chosen yet: sending asks for the project
    const summary = page.locator("aside");
    await expect(summary.getByText("Elige un tipo de proyecto para empezar.")).toBeVisible();

    await page.getByRole("button", { name: /Página web/ }).click();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("switch", { name: "Reservas y citas" }).click();
    await page.getByRole("switch", { name: "Mantenimiento mensual" }).click();

    // US$: 500 + 2×50 + 250 = 850; maintenance goes apart
    await page.getByRole("button", { name: /^US\$$/ }).click();
    const totalUS = summary.getByText(/^US\$[\d,]+$/).last();
    await expect(totalUS).toHaveText("US$850");
    await expect(summary.getByText("US$50/mes")).toBeVisible();

    // RD$ must be exactly dollars × the rate shown
    await page.getByRole("button", { name: /^RD\$$/ }).click();
    const rate = await rateShown(page);
    const totalRD = money(
      await summary
        .getByText(/^RD\$[\d,]+$/)
        .last()
        .innerText(),
    );
    expect(Math.abs(totalRD - 850 * rate)).toBeLessThanOrEqual(850 * 0.005 + 1);

    // Urgent adds 20 %
    await page.getByRole("button", { name: "Urgente +20%" }).click();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await expect(totalUS).toHaveText("US$1,020");

    // Without a name it does not send
    await summary.getByRole("link", { name: "Enviar propuesta por WhatsApp" }).click();
    await expect(summary.getByRole("alert")).toHaveText("Completa los campos marcados con *.");

    await page.getByPlaceholder("Ej.: Laura Méndez").fill("Cliente Prueba");
    await page.getByPlaceholder("Ej.: Café Colonial").fill("Negocio E2E");
    await page.getByPlaceholder("Cuéntame algo de tu proyecto").fill("Quiero vender por Instagram.");

    const waRequest = context.waitForEvent("request", (r) => r.url().startsWith("https://wa.me/"));
    await summary.getByRole("link", { name: "Enviar propuesta por WhatsApp" }).click();
    const url = new URL((await waRequest).url());
    expect(url.host).toBe("wa.me");
    expect(url.pathname).toBe("/19089068105");
    const text = url.searchParams.get("text")!;
    expect(text).toContain("Soy Cliente Prueba (Negocio E2E)");
    expect(text).toContain("Página web — US$500");
    expect(text).toContain("Páginas adicionales ×2 — US$100");
    expect(text).toContain("Plazo: Urgente (+20%)");
    expect(text).toContain("Total estimado: US$1,020");
    expect(text).toContain("Mantenimiento mensual: US$50/mes (aparte)");
    expect(text).toContain("Quiero vender por Instagram.");

    await expect(page.getByRole("heading", { name: "¡Propuesta lista!" })).toBeVisible();

    // It arrives in the admin as a new proposal with the right total
    await loginAsAdmin(context);
    await page.goto("/admin");
    const card = page.getByRole("link", { name: /Negocio E2E/ });
    await expect(card).toBeVisible();
    await expect(card).toContainText("US$1,020"); // 850 + 20 % urgent (maintenance apart)
    await card.click();
    await expect(page.getByRole("textbox", { name: "Proyecto" })).toHaveValue("Página web · 2 extras");
    await expect(page.getByText("Plazo urgente (+20%)").first()).toBeVisible();
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: /Negocio E2E/ })).toHaveCount(0);
  });
});

test.describe("cliente en celular", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("va por los 3 pasos con el total abajo", async ({ page }) => {
    await blockWhatsApp(page);
    await page.goto("/");
    const next = page.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeDisabled();
    await page.getByRole("button", { name: /Landing page/ }).click();
    await expect(next).toBeEnabled();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await expect(page.getByText("US$250").last()).toBeVisible();
    await next.click();

    await expect(page.getByRole("heading", { name: "Agrega extras" })).toBeVisible();
    await page.getByText("Notificaciones por WhatsApp").click(); // the whole row toggles
    await expect(page.getByRole("switch", { name: "Notificaciones por WhatsApp" })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator(".fixed").getByText("US$385")).toBeVisible();

    await page.getByRole("button", { name: "Atrás" }).click();
    await expect(page.getByRole("heading", { name: "¿Qué quieres crear?" })).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    await expect(page.getByRole("heading", { name: "Tu propuesta" })).toBeVisible();
    await page.getByRole("link", { name: "Enviar propuesta por WhatsApp" }).click();
    await expect(page.getByText("Completa los campos marcados con *.").filter({ visible: true })).toBeVisible();
    await page.getByPlaceholder("Ej.: Laura Méndez").fill("Cliente Celular");
    await page.getByPlaceholder("Ej.: Café Colonial").fill("Negocio Celular");
    await page.getByRole("link", { name: "Enviar propuesta por WhatsApp" }).click();
    await expect(page.getByRole("heading", { name: "¡Propuesta lista!" })).toBeVisible();
    await page.getByRole("button", { name: "Hacer otra cotización" }).click();
    await expect(page.getByRole("heading", { name: "Cotiza tu proyecto" })).toBeVisible();
  });
});
