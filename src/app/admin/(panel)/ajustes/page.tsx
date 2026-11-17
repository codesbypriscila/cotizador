import { LogOut } from "lucide-react";
import { PageHeader, PageShell } from "@/components/admin";
import { ProfilePhoto } from "@/components/profile-photo";
import { buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { formatRelative } from "@/lib/format";
import { getRate } from "@/lib/rate";
import { logout } from "../../actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const [settings, rate, adminEmail] = await Promise.all([getSettings(), getRate(), requireAdmin()]);
  const rateLabel = rate.updatedAt
    ? `Actualizada ${formatRelative(rate.updatedAt).toLowerCase()} · ${rate.source}`
    : "Todavía sin actualizar: usa el botón";
  const { whatsapp, messageTemplate, businessName, taxId, ownerName, ownerRole, portfolioUrl } = settings;
  const values = { whatsapp, messageTemplate, businessName, taxId, ownerName, ownerRole, portfolioUrl };

  return (
    <PageShell className="max-w-[1100px]">
      <PageHeader title="Ajustes" back="/admin" />
      <div className="flex items-center gap-3.5 rounded-3xl bg-ink p-4 text-white">
        <ProfilePhoto size={52} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{settings.ownerName}</span>
          <span className="truncate text-[13px] text-[#8DBBFF]">{adminEmail}</span>
        </span>
      </div>
      <SettingsForm values={values} rate={{ rate: rate.rate, label: rateLabel }} />
      <form action={logout}>
        <button className={buttonClass("danger", "w-full lg:w-64")}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </form>
    </PageShell>
  );
}
