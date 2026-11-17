import { describe, expect, it } from "vitest";
import { businessNameError, emailError, personNameError, phoneError, tidy } from "@/lib/validation";

describe("nombre de la persona", () => {
  it.each(["Laura", "Laura Méndez", "José Ñúñez", "Ana María  De la Cruz", "Zoë Ångström"])("acepta %s", (v) => {
    expect(personNameError(v)).toBeNull();
  });
  it.each([
    ["", "Escribe tu nombre."],
    ["   ", "Escribe tu nombre."],
    ["L", "El nombre es muy corto."],
    ["Laura123", "Usa solo letras y espacios, sin números ni símbolos."],
    ["Laura@", "Usa solo letras y espacios, sin números ni símbolos."],
    ["Laura-Méndez", "Usa solo letras y espacios, sin números ni símbolos."],
    ["<script>", "Usa solo letras y espacios, sin números ni símbolos."],
    ["😀 Laura", "Usa solo letras y espacios, sin números ni símbolos."],
  ])("rechaza %j", (v, msg) => {
    expect(personNameError(v)).toBe(msg);
  });
  it("limita el largo", () => {
    expect(personNameError("a".repeat(61))).toMatch(/muy largo/);
  });
  it("limpia espacios repetidos", () => {
    expect(tidy("  Ana   María ")).toBe("Ana María");
  });
});

describe("nombre del negocio", () => {
  it.each(["Café Colonial", "Tienda Mía RD", "H&M Moda, S.R.L.", "O'Brien", "24/7".replace("/", ""), "3D Print"])(
    "acepta %s",
    (v) => {
      expect(businessNameError(v)).toBeNull();
    },
  );
  it.each(["", "!!!", "Café <b>", "Mi tienda #1", "-Inicio"])("rechaza %j", (v) => {
    expect(businessNameError(v)).not.toBeNull();
  });
});

describe("teléfono y correo", () => {
  it("valida teléfonos de 10 a 15 dígitos", () => {
    expect(phoneError("908-906-8105")).toBeNull();
    expect(phoneError("+1 (809) 555-0142")).toBeNull();
    expect(phoneError("")).toBeNull();
    expect(phoneError("", { required: true })).toBe("Escribe el número de WhatsApp.");
    expect(phoneError("abc")).not.toBeNull();
    expect(phoneError("555-0142")).toMatch(/entre 10 y 15/);
  });
  it("valida correos", () => {
    expect(emailError("")).toBeNull();
    expect(emailError("ana@correo.com")).toBeNull();
    expect(emailError("ana@")).not.toBeNull();
    expect(emailError("ana correo.com")).not.toBeNull();
  });
});
