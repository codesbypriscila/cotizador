import { DocEditor } from "../../doc-editor";
import { getEditorLists, toDateInput } from "../../editor-data";

export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/facturas/nueva">) {
  const sp = await searchParams;
  const lists = await getEditorLists();
  const clientId = typeof sp.cliente === "string" && lists.clients.some((c) => c.id === sp.cliente) ? sp.cliente : null;
  const now = new Date().getTime();
  return (
    <DocEditor
      kind="invoice"
      id={null}
      number={null}
      {...lists}
      initial={{ clientId, title: "", discountPct: 0, applyTax: false, notes: "", items: [] }}
      invoice={{
        sent: false,
        issuedAt: toDateInput(new Date(now)),
        dueAt: toDateInput(new Date(now + 30 * 24 * 60 * 60 * 1000)),
      }}
    />
  );
}
