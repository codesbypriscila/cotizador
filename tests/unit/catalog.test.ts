import { describe, expect, it } from "vitest";
import { extraPrice, isMaintenance } from "@/lib/catalog";
import { DEPOSIT_PCT, STATUS_LABEL } from "@/lib/totals";

const maintenance = { name: "Mantenimiento mensual", unit: "MONTHLY" as const, price: 3500 };
const hosting = { name: "Hosting administrado", unit: "MONTHLY" as const, price: 1500 };

describe("catalog rules", () => {
  it("maintenance costs what the chosen project says", () => {
    expect(isMaintenance(maintenance)).toBe(true);
    expect(isMaintenance(hosting)).toBe(false);
    expect(extraPrice(maintenance, { maintenancePrice: 9000 })).toBe(9000); // app móvil
    expect(extraPrice(maintenance, { maintenancePrice: 2500 })).toBe(2500); // landing
  });

  it("falls back to the catalog price", () => {
    expect(extraPrice(maintenance, null)).toBe(3500);
    expect(extraPrice(maintenance, { maintenancePrice: null })).toBe(3500);
    expect(extraPrice(hosting, { maintenancePrice: 9000 })).toBe(1500);
  });

  it("deposit and pending status", () => {
    expect(DEPOSIT_PCT).toBe(30);
    expect(STATUS_LABEL.PENDING).toBe("Pendiente");
  });
});
