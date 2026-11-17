import { BackButton, PageShell } from "@/components/admin";
import { ClientForm } from "../client-form";

export default function NewClientPage() {
  return (
    <PageShell className="max-w-[560px]">
      <BackButton href="/admin/clientes" />
      <ClientForm id={null} values={{ name: "", contact: "", phone: "", email: "", notes: "" }} />
    </PageShell>
  );
}
