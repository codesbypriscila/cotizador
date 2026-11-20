import { expect, type Page, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

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

  test("va por pasos, ve el total en las dos monedas y envía su cotización", async ({ page, context }) => {
    const saves: string[] = [];
    page.on("request", (r) => r.method() === "POST" && saves.push(r.url()));
    await page.goto("/");
    await expect(page.getByText("Desarrolladora de Software")).toBeVisible();
    await expect(page.getByAltText("Priscila Pérez")).toBeVisible();

    // The page starts at the left edge, not centered on wide screens
    const steps = page.getByRole("navigation", { name: "Pasos" });
    expect((await steps.boundingBox())!.x).toBeLessThan(80);

    // Nothing chosen yet
    const summary = page.locator("aside").last();
    await expect(summary.getByText("Elige un tipo de proyecto para empezar.")).toBeVisible();
    const next = page.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeDisabled();

    // Step 1: cards show name, description and price (no icon); new project types are there
    await page.getByRole("button", { name: /^US\$$/ }).click();
    for (const name of [
      "Menú digital con QR",
      "Portafolio/CV web",
      "Sistema de inventario",
      "Automatizaciones/chatbot de WhatsApp",
    ])
      await expect(page.getByRole("button", { name: new RegExp(name.replace(/[/()]/g, "\\$&")) })).toBeVisible();
    const app = page.getByRole("button", { name: /^App móvil/ });
    await expect(app).toContainText("desde US$1,125");
    await expect(app).toContainText("+ US$81/mes"); // maintenance 70 + hosting 11
    await expect(app.locator("svg")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Landing page/ })).toContainText("+ US$30/mes"); // 19 + 11

    await page.getByRole("button", { name: /^Página web/ }).click();
    await expect(steps.getByRole("button", { name: /Proyecto/ })).toContainText("Página web");
    await next.click();

    // Step 2
    await expect(page.getByRole("heading", { name: "Agrega extras" })).toBeVisible();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("switch", { name: "Reservas y citas" }).click();
    await expect(steps.getByRole("button", { name: /Extras/ })).toContainText("2 extras");
    await expect(page.getByRole("switch", { name: "Correos corporativos" })).toBeVisible();

    // Maintenance and hosting are required: already included and they cannot be switched off
    await expect(page.getByRole("heading", { name: "Pagos mensuales" })).toBeVisible();
    for (const name of ["Mantenimiento mensual", "Hosting administrado"])
      await expect(page.getByRole("switch", { name })).toHaveCount(0);
    await expect(page.getByText("Incluido", { exact: true })).toHaveCount(2);
    await expect(page.getByRole("switch", { name: "Soporte prioritario" })).toBeVisible();

    // US$: 375 + 2×30 + 150 = 585; monthly apart: Página web maintenance 25 + hosting 11
    const totalUS = summary.locator("[data-total]");
    await expect(totalUS).toHaveText("US$585");
    await expect(summary.getByText("US$36/mes")).toBeVisible();

    // RD$ must be exactly dollars × the rate shown
    await page.getByRole("button", { name: /^RD\$$/ }).click();
    const rate = await rateShown(page);
    await expect(totalUS).toHaveText(/^RD\$/);
    const totalRD = money(await totalUS.innerText());
    expect(Math.abs(totalRD - 585 * rate)).toBeLessThanOrEqual(585 * 0.005 + 1);

    // Step 3
    await next.click();
    await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
    await page.getByRole("button", { name: "Urgente +20%" }).click();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await expect(totalUS).toHaveText("US$702");

    // Without the client's details nothing is sent
    const send = summary.getByRole("button", { name: "Enviar cotización" });
    await send.click();
    await expect(summary.getByRole("alert")).toHaveText("Completa los campos marcados con *.");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByLabel("Tu nombre").fill("Cliente Prueba");
    await page.getByLabel("Negocio").fill("Negocio E2E");
    await page.getByLabel("Correo").fill("cliente@prueba.test");
    await page.getByLabel("WhatsApp").fill("809 555 0199");
    await page.getByPlaceholder("Cuéntame algo de tu proyecto").fill("Quiero vender por Instagram.");
    await send.click();

    // First it asks; nothing is saved until "Sí, enviar"
    const confirm = page.getByRole("dialog", { name: "¿Enviar tu cotización?" });
    await expect(confirm).toContainText("pendiente");
    expect(saves).toEqual([]);
    await confirm.getByRole("button", { name: "Cancelar" }).click();
    await expect(confirm).toHaveCount(0);
    expect(saves).toEqual([]);

    await send.click();
    await confirm.getByRole("button", { name: "Sí, enviar" }).click();
    const sent = page.getByRole("dialog", { name: "¡Información enviada!" });
    await expect(sent).toContainText("será revisada en un momento");
    await expect(sent).toContainText("809 555 0199");

    // It arrives in the admin as a pending proposal with the right total and the client's contact
    await loginAsAdmin(context);
    await page.goto("/admin");
    const card = page.getByRole("link", { name: /Negocio E2E/ });
    await expect(card).toBeVisible();
    await expect(card).toContainText("US$702"); // 585 + 20 % urgent (monthly apart)
    await card.click();
    await expect(page.getByRole("textbox", { name: "Proyecto" })).toHaveValue("Página web · 2 extras");
    await expect(page.getByRole("button", { name: "Pendiente", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Plazo urgente (+20%)").first()).toBeVisible();
    await expect(page.getByText("WhatsApp: 809 555 0199")).toBeVisible();
    await expect(page.getByText("Correo: cliente@prueba.test")).toBeVisible();
    await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/18095550199");
    // The monthly lines use the Página web maintenance price
    await expect(page.getByText("US$36/mes").first()).toBeVisible();
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: /Negocio E2E/ })).toHaveCount(0);
  });
});

test.describe("cliente en celular", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("va por los 3 pasos con el total abajo", async ({ page }) => {
    await page.goto("/");
    const next = page.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeDisabled();
    await page.getByRole("button", { name: /^Landing page/ }).click();
    await expect(next).toBeEnabled();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await expect(page.getByText("US$190").last()).toBeVisible();
    await next.click();

    await expect(page.getByRole("heading", { name: "Agrega extras" })).toBeVisible();
    await page.getByText("Notificaciones por WhatsApp").click(); // the whole row toggles
    await expect(page.getByRole("switch", { name: "Notificaciones por WhatsApp" })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator(".fixed").getByText("US$280")).toBeVisible();

    await page.getByRole("button", { name: "Atrás" }).click();
    await expect(page.getByRole("heading", { name: "¿Qué quieres crear?" })).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
    const send = page.getByRole("button", { name: "Enviar cotización" }).filter({ visible: true });
    await send.click();
    await expect(page.getByText("Completa los campos marcados con *.").filter({ visible: true })).toBeVisible();
    await page.getByLabel("Tu nombre").fill("Cliente Celular");
    await page.getByLabel("Negocio").fill("Negocio Celular");
    await page.getByLabel("Correo").fill("celular@prueba.test");
    await page.getByLabel("WhatsApp").fill("8295550100");
    await send.click();
    await page.getByRole("dialog").getByRole("button", { name: "Sí, enviar" }).click();
    await expect(page.getByRole("dialog", { name: "¡Información enviada!" })).toBeVisible();
    await page.getByRole("button", { name: "Listo" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Cotiza tu proyecto" })).toBeVisible();
  });
});
