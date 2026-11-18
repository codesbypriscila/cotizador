import { expect, type Page, test } from "@playwright/test";
import { captureMail, E2E_ADMIN, loginAsAdmin, mailOpened } from "./helpers";

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

  test("va por pasos, ve el total en las dos monedas y envía la cotización por correo", async ({ page, context }) => {
    await captureMail(page);
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

    // Step 1
    await page.getByRole("button", { name: /Página web/ }).click();
    await expect(steps.getByRole("button", { name: /Proyecto/ })).toContainText("Página web");
    await next.click();

    // Step 2
    await expect(page.getByRole("heading", { name: "Agrega extras" })).toBeVisible();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
    await page.getByRole("switch", { name: "Reservas y citas" }).click();
    await expect(steps.getByRole("button", { name: /Extras/ })).toContainText("2 extras");

    // Monthly maintenance is required: already included and it cannot be switched off
    await expect(page.getByRole("switch", { name: "Mantenimiento mensual" })).toHaveCount(0);
    await expect(page.getByText("Incluido", { exact: true })).toBeVisible();

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

    // Step 3
    await next.click();
    await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
    await page.getByRole("button", { name: "Urgente +20%" }).click();
    await page.getByRole("button", { name: /^US\$$/ }).click();
    await expect(totalUS).toHaveText("US$1,020");

    // Without the client's details it does not open the email
    const send = summary.getByRole("link", { name: "Enviar cotización por correo" });
    await send.click();
    await expect(summary.getByRole("alert")).toHaveText("Completa los campos marcados con *.");
    expect(await mailOpened(page)).toEqual([]);

    await page.getByLabel("Tu nombre").fill("Cliente Prueba");
    await page.getByLabel("Negocio").fill("Negocio E2E");
    await page.getByLabel("Correo").fill("cliente@prueba.test");
    await page.getByLabel("WhatsApp").fill("809 555 0199");
    await page.getByPlaceholder("Cuéntame algo de tu proyecto").fill("Quiero vender por Instagram.");
    await send.click();

    // The mail app opens, but nothing reaches the admin until the client confirms
    await expect(page.getByRole("heading", { name: "¿Ya enviaste el correo?" })).toBeVisible();
    expect(saves).toEqual([]);
    const [mail] = await mailOpened(page);
    expect(mail.to).toBe(E2E_ADMIN.email); // the admin account's email
    expect(mail.subject).toBe("Cotización: Página web — Negocio E2E");
    expect(mail.body).toContain("Soy Cliente Prueba (Negocio E2E)");
    expect(mail.body).toContain("Página web — US$500");
    expect(mail.body).toContain("Páginas adicionales ×2 — US$100");
    expect(mail.body).toContain("Plazo: Urgente (+20%)");
    expect(mail.body).toContain("Total estimado: US$1,020");
    expect(mail.body).toContain("Mantenimiento mensual: US$50/mes (aparte)");
    expect(mail.body).toContain("Quiero vender por Instagram.");
    expect(mail.body).toContain("Correo: cliente@prueba.test\nWhatsApp: 809 555 0199");

    await page.getByRole("button", { name: "Sí, ya lo envié" }).click();
    await expect(page.getByRole("heading", { name: "¡Cotización enviada!" })).toBeVisible();
    await expect(page.getByText("809 555 0199", { exact: true })).toBeVisible();

    // It arrives in the admin as a new proposal with the right total and the client's contact
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
    await page.goto("/admin/clientes?q=Negocio%20E2E");
    await expect(page.getByText("809 555 0199").first()).toBeAttached();
  });
});

test.describe("cliente en celular", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("va por los 3 pasos con el total abajo", async ({ page }) => {
    await captureMail(page);
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

    await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
    const send = page.getByRole("link", { name: "Enviar cotización por correo" }).filter({ visible: true });
    await send.click();
    await expect(page.getByText("Completa los campos marcados con *.").filter({ visible: true })).toBeVisible();
    await page.getByLabel("Tu nombre").fill("Cliente Celular");
    await page.getByLabel("Negocio").fill("Negocio Celular");
    await page.getByLabel("Correo").fill("celular@prueba.test");
    await page.getByLabel("WhatsApp").fill("8295550100");
    await send.click();
    await expect(page.getByRole("heading", { name: "¿Ya enviaste el correo?" })).toBeVisible();
    expect(await mailOpened(page)).toHaveLength(1);

    // "Volver y cambiar algo" keeps what was typed
    await page.getByRole("button", { name: "Volver y cambiar algo" }).click();
    await expect(page.getByLabel("Tu nombre")).toHaveValue("Cliente Celular");
    await send.click();
    await page.getByRole("button", { name: "Sí, ya lo envié" }).click();
    await expect(page.getByRole("heading", { name: "¡Cotización enviada!" })).toBeVisible();
    await page.getByRole("button", { name: "Hacer otra cotización" }).click();
    await expect(page.getByRole("heading", { name: "Cotiza tu proyecto" })).toBeVisible();
  });
});
