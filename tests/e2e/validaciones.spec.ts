import { expect, test } from "@playwright/test";
import { captureMail, firstLink, loginAsAdmin, mailOpened } from "./helpers";

test.use({ viewport: { width: 1440, height: 1000 } });

test.describe("cotizador: datos obligatorios", () => {
  test("no se abre el correo si los datos están mal", async ({ page }) => {
    await captureMail(page);
    const saves: string[] = [];
    page.on("request", (r) => r.method() === "POST" && saves.push(r.url()));

    await page.goto("/");
    await page.getByRole("button", { name: /Página web/ }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Required marks: name, business, email, WhatsApp and timeline; the note has none and does not say "opcional"
    await expect(page.locator("label[for=cliente-nombre]")).toHaveText("Tu nombre *");
    await expect(page.locator("label[for=cliente-negocio]")).toHaveText("Negocio *");
    await expect(page.locator("label[for=cliente-correo]")).toHaveText("Correo *");
    await expect(page.locator("label[for=cliente-telefono]")).toHaveText("WhatsApp *");
    await expect(page.getByText(/^Plazo \*$/)).toBeVisible();
    await expect(page.getByText("Nota", { exact: true })).toBeVisible();
    await expect(page.getByText(/opcional/i)).toHaveCount(0);

    const name = page.getByLabel("Tu nombre");
    const business = page.getByLabel("Negocio");
    const email = page.getByLabel("Correo");
    const phone = page.getByLabel("WhatsApp");
    const send = page.locator("aside").last().getByRole("link", { name: "Enviar cotización por correo" });

    // Empty
    await send.click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Escribe el nombre de tu negocio.")).toBeVisible();
    await expect(page.getByText("Escribe tu correo.")).toBeVisible();
    await expect(page.getByText("Escribe el número de WhatsApp.")).toBeVisible();
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");

    // Numbers and symbols are not allowed in the name
    await business.fill("Café Colonial");
    await email.fill("laura@correo.com");
    await phone.fill("809 555 0123");
    for (const bad of ["Laura123", "Laura@Méndez", "Laura_M", "L"]) {
      await name.fill(bad);
      await send.click();
      await expect(page.locator("#cliente-nombre-error")).toBeVisible();
    }
    await name.fill("José Ñúñez");
    await business.fill("!!!");
    await send.click();
    await expect(page.locator("#cliente-negocio-error")).toHaveText("Usa letras, números y solo estos signos: . , & ' -");
    await business.fill("H&M Moda, S.R.L.");

    // Email and WhatsApp must be real
    await email.fill("laura@");
    await send.click();
    await expect(page.locator("#cliente-correo-error")).toHaveText("Ese correo no parece válido.");
    await expect(email).toBeFocused();
    await email.fill("laura@correo.com");
    for (const bad of ["555", "abc-defg-hij"]) {
      await phone.fill(bad);
      await send.click();
      await expect(page.locator("#cliente-telefono-error")).toBeVisible();
    }

    expect(await mailOpened(page)).toEqual([]);
    expect(saves).toEqual([]);

    // Valid data: accents, ñ and business signs are fine
    await phone.fill("+1 (809) 555-0123");
    for (const id of ["nombre", "negocio", "correo", "telefono"])
      await expect(page.locator(`#cliente-${id}-error`)).toHaveCount(0);
    await send.click();
    await expect(page.getByRole("heading", { name: "¿Ya enviaste el correo?" })).toBeVisible();
    const [mail] = await mailOpened(page);
    expect(mail.body).toContain("Soy José Ñúñez (H&M Moda, S.R.L.)");
    expect(mail.body).toContain("Correo: laura@correo.com");
    // Still nothing saved: only "Sí, ya lo envié" saves it
    expect(saves).toEqual([]);
  });
});

test.describe("admin: validaciones", () => {
  test.beforeEach(async ({ context }) => loginAsAdmin(context));

  test("ficha de cliente: nombre obligatorio, contacto solo letras, teléfono y correo válidos", async ({ page }) => {
    await page.goto("/admin/clientes/nuevo");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await expect(page.locator("#cliente-name-error")).toBeVisible();

    await page.getByLabel("Nombre del negocio o persona").fill("Validaciones SRL");
    await page.getByLabel("Persona de contacto").fill("Ana 2");
    await page.getByLabel("WhatsApp / teléfono").fill("abc");
    await page.getByLabel("Correo").fill("ana@");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await expect(page.locator("#cliente-contact-error")).toHaveText("Usa solo letras y espacios, sin números ni símbolos.");
    await expect(page.locator("#cliente-phone-error")).toBeVisible();
    await expect(page.locator("#cliente-email-error")).toHaveText("Ese correo no parece válido.");
    await expect(page).toHaveURL(/\/nuevo$/);
    // What was typed stays in the form
    await expect(page.getByLabel("Nombre del negocio o persona")).toHaveValue("Validaciones SRL");

    await page.getByLabel("Persona de contacto").fill("Ana Pérez");
    await page.getByLabel("WhatsApp / teléfono").fill("809 555 0123");
    await page.getByLabel("Correo").fill("ana@correo.com");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await expect(page).toHaveURL(/\/admin\/clientes\/c[a-z0-9]+$/);
  });

  test("abonos: monto, fecha y método se validan y no se paga de más", async ({ page }) => {
    await page.goto("/admin/facturas?estado=enviada");
    await page.goto(await firstLink(page, "/admin/facturas/"));
    const amount = page.getByLabel("Monto (US$)");
    await expect(page.locator("#abono").getByText("*").first()).toBeVisible();

    // Empty amount
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.locator("#abono-monto-error")).toHaveText("El monto debe ser mayor que cero.");

    // More than what is owed
    await amount.fill("999999");
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.locator("#abono-monto-error")).toContainText("No puede ser más de lo pendiente");

    // Future date
    await amount.fill("10");
    await page.getByLabel("Fecha").evaluate((el: HTMLInputElement) => {
      el.removeAttribute("max");
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      for (const v of ["2099-01-01", "2099-01-02"]) {
        set.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.locator("#abono-fecha-error")).toHaveText("La fecha no puede ser en el futuro.");
    await expect(amount).toHaveValue("10"); // kept after the error

    // Missing method
    await page.getByLabel("Fecha").evaluate((el: HTMLInputElement) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });
      for (const v of ["2026-01-01", today]) {
        set.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.getByLabel("Método").fill("");
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.locator("#abono-metodo-error")).toHaveText("Escribe cómo te pagaron.");

    // "Pagó todo" fills exactly what is pending and settles the invoice
    await page.getByLabel("Método").fill("Efectivo");
    await page.getByRole("button", { name: "Pagó todo lo pendiente" }).click();
    await page.getByRole("button", { name: "Registrar abono" }).click();
    await expect(page.getByText("Pagada").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Registrar abono" })).toHaveCount(0);
  });

  test("recordatorio por WhatsApp solo con un número válido", async ({ page }) => {
    // Invoice for a client without phone
    await page.goto("/admin/facturas/nueva");
    await page.getByLabel("Cliente", { exact: true }).selectOption("new");
    await page.getByLabel("Nombre del cliente o negocio").fill("Sin Teléfono");
    await page.getByLabel("Proyecto").fill("Landing");
    await page.getByRole("button", { name: "Partida libre" }).click();
    await page.getByLabel("Concepto").last().fill("Landing page");
    await page.getByLabel("Precio en US$").last().fill("300");
    await page.getByRole("switch", { name: "Factura enviada" }).click();
    await expect(page.getByText("Agrega el WhatsApp del cliente para poder enviarlo.")).toBeVisible();
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/editar$/);

    await page.goto(page.url().replace(/\/editar$/, ""));
    const box = page.getByRole("region", { name: "Recordatorio por WhatsApp" });
    await expect(box).toContainText("Hola Sin Teléfono");
    await expect(box.getByRole("alert")).toContainText("no tiene WhatsApp guardado");
    await expect(box.getByRole("link", { name: "Enviar recordatorio" })).toHaveCount(0);

    // Add a valid phone in the client page, then the reminder can be sent
    await box.getByRole("link", { name: "Corregir en la ficha del cliente" }).click();
    await page.getByLabel("WhatsApp / teléfono").fill("908-906-8105");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();
    await page.goBack();
    await page.reload();
    const link = page
      .getByRole("region", { name: "Recordatorio por WhatsApp" })
      .getByRole("link", { name: "Enviar recordatorio" });
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/19089068105\?text=Hola%20Sin%20Tel%C3%A9fono/);
  });

  test("ajustes: el WhatsApp tiene que ser un número válido", async ({ page }) => {
    await page.goto("/admin/ajustes");
    const field = page.locator('input[name="whatsapp"]');
    const original = await field.inputValue();
    await field.fill("12ab");
    await page.getByRole("button", { name: "Guardar ajustes" }).click();
    await expect(page.getByText(/^WhatsApp: /)).toBeVisible();
    await field.fill(original);
  });

  test("ficha del cliente: WhatsApp abre su chat y Correo abre la app de correo", async ({ page }) => {
    await page.goto("/admin/clientes");
    await page
      .getByRole("link", { name: /Café Colonial/ })
      .first()
      .click();
    // Wait until the side panel shows this client before opening its page.
    await expect(page.locator("aside").getByText("Café Colonial", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Abrir ficha completa" }).click();
    await expect(page).toHaveURL(/\/admin\/clientes\/c[a-z0-9]+$/);

    // WhatsApp goes to the client's own chat (809 number gets the country code 1)
    await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/18095550142");

    // Correo opens the phone's own mail app ("New message") with the greeting written
    await expect(page.getByRole("link", { name: "Correo" })).toHaveAttribute(
      "href",
      /^mailto:[^?]*\?body=Hola%20Laura%20M%C3%A9ndez%2C/,
    );
  });
});
