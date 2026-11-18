import { expect, test } from "@playwright/test";
import { E2E_ADMIN, loginAsAdmin } from "./helpers";

test.use({ viewport: { width: 1440, height: 1000 } });

test("el admin está protegido y el login funciona", async ({ page }) => {
  await page.goto("/admin/facturas");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.getByLabel("Correo").fill(E2E_ADMIN.email);
  await page.getByLabel("Contraseña").fill("contraseña-equivocada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");

  await page.getByLabel("Contraseña").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /Hola, Priscila/ })).toBeVisible();

  // Logout from Ajustes
  await page.goto("/admin/ajustes");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test.describe("flujo completo del admin", () => {
  test.beforeEach(async ({ context }) => loginAsAdmin(context));

  test("cliente → cotización → factura → abonos", async ({ page }) => {
    // New client
    await page.goto("/admin/clientes/nuevo");
    await page.getByLabel("Nombre del negocio o persona").fill("Pruebas SRL");
    await page.getByLabel("Persona de contacto").fill("Ana Prueba");
    await page.getByLabel("WhatsApp / teléfono").fill("809-555-0199");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await expect(page).toHaveURL(/\/admin\/clientes\/c[a-z0-9]+$/);
    await expect(page.getByText("Pruebas SRL").filter({ visible: true }).first()).toBeVisible();

    // New quote for that client, from the client page
    await page.getByRole("link", { name: "Nueva cotización" }).click();
    await expect(page.getByLabel("Cliente", { exact: true })).toHaveValue(/c[a-z0-9]+/);
    await page.getByRole("button", { name: "Del catálogo" }).click();
    await page.getByRole("button", { name: /^Página web Proyecto/ }).click();
    await expect(page.getByLabel("Proyecto")).toHaveValue("Página web");
    await page.getByRole("button", { name: "Partida libre" }).click();
    await page.getByLabel("Concepto").last().fill("Fotos de productos");
    await page.getByLabel("Precio en US$").last().fill("120.50");
    await page.getByLabel("Descuento en porcentaje").fill("10");
    await page.getByRole("switch", { name: "Aplicar ITBIS" }).click();
    // (500 + 120.50) − 10 % = 558.45; ITBIS 18 % = 100.52 → 658.97
    await expect(page.getByText("US$658.97").filter({ visible: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/admin\/cotizaciones\/c[a-z0-9]+$/);
    const quoteUrl = page.url();
    await expect(page.getByRole("heading", { name: /COT-\d{4}/ })).toBeVisible();
    await expect(page.getByText("US$658.97").filter({ visible: true }).first()).toBeVisible();

    // Status and WhatsApp link to the client
    await page.getByRole("button", { name: "Enviada", exact: true }).click();
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();
    const send = page.getByRole("link", { name: /Enviar por WhatsApp/ });
    await expect(send).toHaveAttribute("href", /^https:\/\/wa\.me\/18095550199\?text=/);

    // Duplicate, then delete the copy
    await page.getByRole("button", { name: "Duplicar" }).click();
    await expect(page.getByLabel("Proyecto")).toHaveValue("Página web (copia)");
    await page.getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("button", { name: "Sí, borrar" }).click();
    await expect(page).toHaveURL(/\/admin\/cotizaciones$/);
    await expect(page.getByText("Página web (copia)")).toHaveCount(0);

    // Convert the original into an invoice
    await page.goto(quoteUrl);
    await page.getByRole("button", { name: "Convertir en factura" }).click();
    await expect(page).toHaveURL(/\/admin\/facturas\/c[a-z0-9]+$/);
    const invoiceUrl = page.url();
    await expect(page.getByText("US$658.97").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Borrador").filter({ visible: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "Marcar como enviada" }).click();
    await expect(page.getByText("Enviada").filter({ visible: true }).first()).toBeVisible();

    // Partial payment, then the rest
    await page.getByLabel("Monto (US$)").fill("300");
    await page.getByLabel("Concepto", { exact: true }).fill("Anticipo");
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.getByText("Parcial").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("US$358.97").filter({ visible: true }).first()).toBeVisible(); // pending
    await page.getByLabel("Monto (US$)").fill("358.97");
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.getByText("Pagada").filter({ visible: true }).first()).toBeVisible();

    // Removing a payment goes back to partial
    await page.getByRole("button", { name: "Borrar abono" }).first().click();
    await page.getByRole("button", { name: "Sí, borrar" }).click();
    await expect(page.getByText("Parcial").filter({ visible: true }).first()).toBeVisible();

    // A past due date makes it overdue
    await page.goto(`${invoiceUrl}/editar`);
    // fill() on a date input skips React's change tracking; set it the way a date picker does.
    // Retried until the editor is hydrated and its message preview shows the new date.
    await expect(async () => {
      await page.getByLabel("Vence").evaluate((el: HTMLInputElement) => {
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
        // Two changes, so React always sees a different value even if the first set landed before hydration.
        for (const v of ["2026-01-14", "2026-01-15"]) {
          set.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      await expect(page.getByText(/vence el 15 ene 2026/)).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 20_000 });
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();
    await page.goto(invoiceUrl);
    await expect(page.getByText("Vencida").filter({ visible: true }).first()).toBeVisible();

    // It shows in the filtered list
    await page.goto("/admin/facturas?estado=vencida");
    await expect(page.getByText("Pruebas SRL").filter({ visible: true }).first()).toBeVisible();

    // Deleting the client removes its quotes and invoices
    await page.goto("/admin/clientes");
    await page
      .getByRole("link", { name: /Pruebas SRL/ })
      .first()
      .click();
    await page.getByRole("link", { name: "Abrir ficha completa" }).click();
    await page.getByRole("button", { name: "Borrar cliente" }).click();
    await page.getByRole("button", { name: "Sí, borrar" }).click();
    await expect(page).toHaveURL(/\/admin\/clientes$/);
    await page.goto("/admin/facturas");
    await expect(page.getByText("Pruebas SRL")).toHaveCount(0);
  });

  test("factura nueva con cliente nuevo desde cero", async ({ page }) => {
    await page.goto("/admin/facturas/nueva");
    await page.getByLabel("Cliente", { exact: true }).selectOption("new");
    await page.getByLabel("Nombre del cliente o negocio").fill("Cliente Rápido");
    await page.getByLabel("WhatsApp", { exact: true }).fill("908-906-8105");
    await page.getByLabel("Proyecto").fill("Landing de campaña");
    await page.getByRole("button", { name: "Partida libre" }).click();
    await page.getByLabel("Concepto").last().fill("Landing page");
    await page.getByLabel("Precio en US$").last().fill("300");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/admin\/facturas\/c[a-z0-9]+\/editar$/);
    await page.goto("/admin/facturas");
    await expect(page.getByText("Cliente Rápido").filter({ visible: true }).first()).toBeVisible();
  });

  test("guardar sin partidas muestra un error claro", async ({ page }) => {
    await page.goto("/admin/cotizaciones/nueva");
    await page.getByLabel("Cliente", { exact: true }).selectOption({ index: 1 });
    await page.getByLabel("Proyecto").fill("Sin partidas");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator("main").getByRole("alert")).toContainText("partidas");
    await expect(page).toHaveURL(/\/nueva$/);
  });

  test("catálogo: crear, ordenar, ocultar y borrar alimenta el cotizador", async ({ page }) => {
    await page.goto("/admin/catalogo?tipo=extras&nuevo=1");
    // Monthly maintenance comes marked as required
    await expect(
      page
        .getByRole("link", { name: /Mantenimiento mensual/ })
        .filter({ visible: true })
        .first(),
    ).toContainText("Obligatorio");
    const form = page.locator("aside form");
    await form.locator('input[name="name"]').fill("SEO básico");
    await form.locator('input[name="description"]').fill("Para salir en Google");
    await form.getByLabel("price", { exact: true }).fill("150");
    await form.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/guardado=1/);
    await expect(page.getByText("SEO básico").filter({ visible: true }).first()).toBeVisible();

    // Shows in the public builder, priced in dollars and pesos
    const pub = await page.request.get("/").then((r) => r.text());
    expect(pub).toContain("SEO básico");

    // Move it up one place
    const before = await page
      .getByRole("button", { name: /^Subir / })
      .evaluateAll((b) => b.map((x) => x.getAttribute("aria-label")));
    await page.getByRole("button", { name: "Subir SEO básico" }).click();
    await expect
      .poll(async () =>
        page.getByRole("button", { name: /^Subir / }).evaluateAll((b) => b.map((x) => x.getAttribute("aria-label"))),
      )
      .not.toEqual(before);

    // Hide it: gone from the public page
    await page.getByRole("switch", { name: "Mostrar SEO básico en el cotizador" }).click();
    await expect.poll(async () => (await page.request.get("/").then((r) => r.text())).includes("SEO básico")).toBe(false);

    // Delete it
    await page
      .getByRole("link", { name: /SEO básico/ })
      .first()
      .click();
    await page.locator("aside").getByRole("button", { name: "Borrar del catálogo" }).click();
    await page.locator("aside").getByRole("button", { name: "Sí, borrar" }).click();
    await expect(page.getByText("SEO básico")).toHaveCount(0);
  });

  test("ajustes: guarda tu WhatsApp y el cotizador envía a tu correo", async ({ page }) => {
    await page.goto("/admin/ajustes");
    await expect(page.getByText(/US\$1 = RD\$\d+\.\d{2}/)).toBeVisible();
    const field = page.locator('input[name="whatsapp"]');
    const original = await field.inputValue();
    await field.fill("1 908 906 0000");
    await page.getByRole("button", { name: "Guardar ajustes" }).click();
    await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: /Landing page/ }).click();
    await expect(page.locator("aside").last().getByRole("link", { name: "Enviar cotización por correo" })).toHaveAttribute(
      "href",
      /^mailto:admin@prueba\.test\?subject=Cotizaci%C3%B3n%3A%20Landing%20page&body=/,
    );

    await page.goto("/admin/ajustes");
    await page.locator('input[name="whatsapp"]').fill(original);
    await page.getByRole("button", { name: "Guardar ajustes" }).click();
    await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();
  });
});
