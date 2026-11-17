import { describe, expect, it } from "vitest";
import { mailtoLink } from "@/lib/mail";

describe("mailtoLink", () => {
  it("opens the mail app with subject and body already written", () => {
    expect(mailtoLink("hola@correo.com", { subject: "Tu cotización", body: "Hola Ana,\n\nGracias" })).toBe(
      "mailto:hola@correo.com?subject=Tu%20cotizaci%C3%B3n&body=Hola%20Ana%2C%0D%0A%0D%0AGracias",
    );
  });

  it("works without an address, so the person can type it", () => {
    expect(mailtoLink("", { subject: "Hola" })).toBe("mailto:?subject=Hola");
    expect(mailtoLink(" ana@x.do ")).toBe("mailto:ana@x.do");
  });

  it("escapes characters that would break the link", () => {
    expect(mailtoLink("a@b.com", { subject: "Precio & plazo?" })).toBe("mailto:a@b.com?subject=Precio%20%26%20plazo%3F");
  });
});
