import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken, readSessionToken } from "@/lib/session";
import { DEFAULT_TEMPLATE, fillTemplate, phoneForWhatsApp, whatsappLink } from "@/lib/whatsapp";

const values = {
  cliente: "Laura",
  negocio: "Café Colonial",
  proyecto: "Página web — US$500",
  extras: ["Reservas y citas — US$250"],
  plazo: "Normal (3–4 semanas)",
  total: "US$750 (≈ RD$45,718)",
  mensual: "",
  nota: "",
};

describe("mensaje de WhatsApp", () => {
  it("rellena la plantilla", () => {
    const msg = fillTemplate(DEFAULT_TEMPLATE, values);
    expect(msg).toContain("Soy Laura (Café Colonial)");
    expect(msg).toContain("• Reservas y citas — US$250");
    expect(msg).toContain("Total estimado: US$750 (≈ RD$45,718)");
  });

  it("quita las líneas y los paréntesis de datos vacíos", () => {
    const msg = fillTemplate(DEFAULT_TEMPLATE, { ...values, negocio: "", extras: [] });
    expect(msg).toContain("Soy Laura. Quiero cotizar");
    expect(msg).not.toContain("📝");
    expect(msg).not.toContain("()");
    expect(msg).not.toMatch(/\n{3,}/);
  });

  it("arma el número con código de país", () => {
    expect(phoneForWhatsApp("908-906-8105")).toBe("19089068105");
    expect(phoneForWhatsApp("19089068105")).toBe("19089068105");
    expect(phoneForWhatsApp("809-555-0142")).toBe("18095550142");
    expect(whatsappLink("19089068105", "Hola & adiós")).toBe("https://wa.me/19089068105?text=Hola%20%26%20adi%C3%B3s");
  });
});

describe("login", () => {
  it("acepta solo la contraseña correcta", () => {
    const hash = hashPassword("clave-segura-123");
    expect(verifyPassword("clave-segura-123", hash)).toBe(true);
    expect(verifyPassword("otra", hash)).toBe(false);
    expect(verifyPassword("clave-segura-123", "texto-plano")).toBe(false);
  });

  it("la sesión firmada no se puede falsificar ni dura para siempre", () => {
    const secret = "s".repeat(40);
    const token = createSessionToken("yo@correo.com", secret, 0);
    expect(readSessionToken(token, secret, 1000)).toBe("yo@correo.com");
    expect(readSessionToken(token, "otra".repeat(10), 1000)).toBeNull();
    expect(readSessionToken(`${token}x`, secret, 1000)).toBeNull();
    expect(readSessionToken(token, secret, 31 * 24 * 60 * 60 * 1000)).toBeNull();
    expect(readSessionToken(undefined, secret)).toBeNull();
  });
});
