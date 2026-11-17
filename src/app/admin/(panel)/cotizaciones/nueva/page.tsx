import { DocEditor } from "../../doc-editor";
import { getEditorLists, toDateInput } from "../../editor-data";

export default async function NewQuotePage({ searchParams }: PageProps<"/admin/cotizaciones/nueva">) {
  const sp = await searchParams;
  const lists = await getEditorLists();
  const clientId = typeof sp.cliente === "string" && lists.clients.some((c) => c.id === sp.cliente) ? sp.cliente : null;
  return (
    <DocEditor
      kind="quote"
      id={null}
      number={null}
      {...lists}
      initial={{ clientId, title: "", discountPct: 0, applyTax: false, notes: "", items: [] }}
      quote={{
        status: "DRAFT",
        urgent: false,
        validUntil: toDateInput(new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)),
      }}
    />
  );
}
