import { describe, expect, it } from "vitest";
import { centsToInput, formatDOP, formatIn, formatUSD, parseUSD, toDOP } from "@/lib/money";

describe("dólares", () => {
  it("muestra centavos solo cuando hay", () => {
    expect(formatUSD(50000)).toBe("US$500");
    expect(formatUSD(49999)).toBe("US$499.99");
    expect(formatUSD(110000)).toBe("US$1,100");
    expect(formatUSD(-5500)).toBe("−US$55");
  });

  it("lee lo que se escribe en el admin", () => {
    expect(parseUSD("500")).toBe(50000);
    expect(parseUSD("1,250.5")).toBe(125050);
    expect(parseUSD("US$ 499.99")).toBe(49999);
    expect(parseUSD("12.")).toBe(1200);
    expect(parseUSD("")).toBe(0);
    expect(parseUSD("abc")).toBe(0);
  });

  it("vuelve a escribir el monto igual que lo lee", () => {
    for (const cents of [100, 5000, 49999, 125050, 1234567]) expect(parseUSD(centsToInput(cents))).toBe(cents);
  });
});

describe("pesos = dólares × tasa", () => {
  const rate = 60.957776;

  it("convierte exacto y redondea a pesos enteros", () => {
    expect(toDOP(50000, rate)).toBe(30479); // 500 × 60.957776 = 30,478.89
    expect(toDOP(110000, rate)).toBe(67054); // 1,100 × 60.957776 = 67,053.55
    expect(formatDOP(110000, rate)).toBe("RD$67,054");
  });

  it("usa la moneda que eligió el cliente", () => {
    expect(formatIn("USD", 25000, rate)).toBe("US$250");
    expect(formatIn("DOP", 25000, rate)).toBe("RD$15,239");
  });
});
