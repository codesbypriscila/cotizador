import { prisma } from "@/lib/prisma";
import { type BuilderItem, QuoteBuilder } from "./quote-builder";

// Rendered statically and rebuilt every hour; saving the catalog or settings rebuilds it at once.
// Prices are never sent to the browser: the admin sees the estimate when the quote arrives.
export const revalidate = 3600;

export default async function Home() {
  const [settings, items] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.catalogItem.findMany({
      where: { visible: true },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
      select: { id: true, kind: true, name: true, description: true, unit: true, required: true },
    }),
  ]);

  const toDto = (i: (typeof items)[number]): BuilderItem => ({
    id: i.id,
    name: i.name,
    description: i.description,
    unit: i.unit,
    required: i.kind === "EXTRA" && i.required,
  });

  return (
    <QuoteBuilder
      projects={items.filter((i) => i.kind === "PROJECT").map(toDto)}
      extras={items.filter((i) => i.kind === "EXTRA").map(toDto)}
      settings={{
        ownerName: settings?.ownerName ?? "Priscila Pérez",
        ownerRole: settings?.ownerRole ?? "Desarrolladora de Software",
        portfolioUrl: settings?.portfolioUrl ?? "",
      }}
    />
  );
}
