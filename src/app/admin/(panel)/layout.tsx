import type { Metadata } from "next";
import { headers } from "next/headers";
import { MoneyProvider } from "@/components/money";
import { getAdminMoney } from "@/lib/admin-money";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { BottomNav, Sidebar } from "./nav";

export const metadata: Metadata = { title: "Admin · Cotizador", robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const [settings, newCount, money] = await Promise.all([
    getSettings(),
    prisma.quote.count({ where: { source: "PUBLIC", seenAt: null } }),
    getAdminMoney(),
  ]);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <MoneyProvider currency={money.currency} rate={money.rate}>
      <div className="flex min-h-dvh">
        <Sidebar ownerName={settings.ownerName} publicUrl={`${proto}://${host}`} newCount={newCount} />
        <div className="min-w-0 flex-1 pb-28 lg:pb-0">{children}</div>
        <BottomNav newCount={newCount} />
      </div>
    </MoneyProvider>
  );
}
