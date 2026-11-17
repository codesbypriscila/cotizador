import { describe, expect, it } from "vitest";
import { computeTotals, invoiceStatus } from "@/lib/totals";

const web = [
  { quantity: 1, unitPrice: 50000, unit: "ONCE" as const }, // Página web US$500
  { quantity: 3, unitPrice: 5000, unit: "EACH" as const }, // 3 páginas × US$50
  { quantity: 1, unitPrice: 25000, unit: "ONCE" as const }, // Reservas US$250
  { quantity: 1, unitPrice: 5000, unit: "MONTHLY" as const }, // Mantenimiento US$50/mes
];

describe("totales", () => {
  it("suma lo único y deja lo mensual aparte", () => {
    const t = computeTotals(web);
    expect(t.subtotal).toBe(90000);
    expect(t.monthly).toBe(5000);
    expect(t.total).toBe(90000);
  });

  it("aplica urgente, descuento e ITBIS en ese orden", () => {
    const t = computeTotals(web, { urgent: true, discountPct: 10, applyTax: true });
    expect(t.urgentFee).toBe(18000); // 20 % de 900
    expect(t.discount).toBe(10800); // 10 % de 1,080
    expect(t.tax).toBe(17496); // 18 % de 972
    expect(t.total).toBe(114696); // US$1,146.96
  });

  it("sin partidas da cero", () => {
    expect(computeTotals([]).total).toBe(0);
  });
});

describe("estado de la factura", () => {
  const now = new Date("2026-11-13T12:00:00Z");
  const future = new Date("2026-12-13T12:00:00Z");
  const past = new Date("2026-10-13T12:00:00Z");

  it("borrador mientras no se envía", () => {
    expect(invoiceStatus({ sent: false, total: 100, paid: 0, dueAt: past, now })).toBe("DRAFT");
  });
  it("enviada, parcial y pagada según los abonos", () => {
    expect(invoiceStatus({ sent: true, total: 100, paid: 0, dueAt: future, now })).toBe("SENT");
    expect(invoiceStatus({ sent: true, total: 100, paid: 40, dueAt: future, now })).toBe("PARTIAL");
    expect(invoiceStatus({ sent: true, total: 100, paid: 100, dueAt: future, now })).toBe("PAID");
  });
  it("vencida si pasó la fecha sin pagarse completa; pagada gana a vencida", () => {
    expect(invoiceStatus({ sent: true, total: 100, paid: 40, dueAt: past, now })).toBe("OVERDUE");
    expect(invoiceStatus({ sent: true, total: 100, paid: 100, dueAt: past, now })).toBe("PAID");
  });
});
