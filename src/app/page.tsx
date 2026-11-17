import { prisma } from "@/lib/prisma";
import { getRate } from "@/lib/rate";
import { DEFAULT_TEMPLATE } from "@/lib/whatsapp";
import { type BuilderItem, QuoteBuilder } from "./quote-builder";

// Rendered statically and rebuilt every hour; getRate() refreshes the dollar
// rate when it is older than 6 hours. Saving the catalog or settings rebuilds it at once.
export const revalidate = 3600;

export default async function Home() {
  const [settings, admin, items, rate] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.admin.findFirst({ select: { email: true } }),
    prisma.catalogItem.findMany({ where: { visible: true }, orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
    getRate(),
  ]);

  const toDto = (i: (typeof items)[number]): BuilderItem => ({
    id: i.id,
    name: i.name,
    description: i.description,
    icon: i.icon,
    price: i.price,
    unit: i.unit,
  });

  return (
    <QuoteBuilder
      projects={items.filter((i) => i.kind === "PROJECT").map(toDto)}
      extras={items.filter((i) => i.kind === "EXTRA").map(toDto)}
      settings={{
        email: admin?.email ?? "priscilaperezherrera@gmail.com",
        rate: rate.rate,
        template: settings?.messageTemplate ?? DEFAULT_TEMPLATE,
        ownerName: settings?.ownerName ?? "Priscila Pérez",
        ownerRole: settings?.ownerRole ?? "Desarrolladora de Software",
        portfolioUrl: settings?.portfolioUrl ?? "",
      }}
    />
  );
}
