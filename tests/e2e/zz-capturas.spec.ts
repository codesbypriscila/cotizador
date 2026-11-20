import { test } from "@playwright/test";

// Screenshots of the public quote builder on a phone, for the README. Only runs with CAPTURAS=1:
//   CAPTURAS=1 npx playwright test zz-capturas
test.skip(!process.env.CAPTURAS, "Set CAPTURAS=1 to refresh docs/screenshots");

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

const out = (name: string) => `docs/screenshots/${name}.png`;

test("cotizador en celular", async ({ page }) => {
  await page.goto("/");
  // Hide the Next.js development badge so it does not cover the screenshots.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.getByRole("button", { name: /^Página web/ }).click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: out("celular-1-proyecto") });

  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Agregar Páginas adicionales" }).click();
  await page.getByRole("switch", { name: "Reservas y citas" }).click();
  await page.getByRole("switch", { name: "Notificaciones por WhatsApp" }).click();
  await page.screenshot({ path: out("celular-2-extras") });

  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel("Tu nombre").fill("Laura Méndez");
  await page.getByLabel("Negocio").fill("Café Colonial");
  await page.getByLabel("Correo").fill("laura@cafecolonial.do");
  await page.getByLabel("WhatsApp").fill("809 555 0142");
  await page.screenshot({ path: out("celular-3-propuesta") });
});
