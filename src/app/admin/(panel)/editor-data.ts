import "server-only";
import { prisma } from "@/lib/prisma";
import { getRate } from "@/lib/rate";
import type { EditorCatalogItem, EditorClient, EditorLine } from "./doc-editor";

export async function getEditorLists(): Promise<{ clients: EditorClient[]; catalog: EditorCatalogItem[]; rate: number }> {
  const [clients, catalog, rate] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, contact: true, phone: true, email: true },
    }),
    prisma.catalogItem.findMany({
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
      select: { id: true, kind: true, name: true, description: true, icon: true, price: true, unit: true },
    }),
    getRate(),
  ]);
  return { clients, catalog, rate: rate.rate };
}

export const toLines = (
  items: {
    id: string;
    name: string;
    description: string;
    icon: string;
    quantity: number;
    unitPrice: number;
    unit: EditorLine["unit"];
    sortOrder: number;
  }[],
): EditorLine[] =>
  [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, description, icon, quantity, unitPrice, unit }) => ({
      key: id,
      name,
      description,
      icon,
      quantity,
      unitPrice,
      unit,
    }));

/** Date -> "yyyy-mm-dd" in Santo Domingo time, for <input type="date">. */
export const toDateInput = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });
