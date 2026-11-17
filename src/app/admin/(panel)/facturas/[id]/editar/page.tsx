import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/data";
import { invoiceNumber } from "@/lib/format";
import { DocEditor } from "../../../doc-editor";
import { getEditorLists, toDateInput, toLines } from "../../../editor-data";

export default async function EditInvoicePage({ params }: PageProps<"/admin/facturas/[id]/editar">) {
  const { id } = await params;
  const [inv, lists] = await Promise.all([getInvoice(id), getEditorLists()]);
  if (!inv) notFound();
  return (
    <DocEditor
      key={inv.id}
      kind="invoice"
      id={inv.id}
      number={invoiceNumber(inv.number)}
      {...lists}
      displayStatus={inv.status}
      initial={{
        clientId: inv.clientId,
        title: inv.title,
        discountPct: inv.discountPct,
        applyTax: inv.applyTax,
        notes: inv.notes,
        items: toLines(inv.items),
      }}
      invoice={{ sent: inv.sent, issuedAt: toDateInput(inv.issuedAt), dueAt: toDateInput(inv.dueAt) }}
    />
  );
}
