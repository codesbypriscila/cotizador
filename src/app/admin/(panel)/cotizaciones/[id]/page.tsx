import { notFound } from "next/navigation";
import { getQuote } from "@/lib/data";
import { quoteNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { DocEditor } from "../../doc-editor";
import { getEditorLists, toDateInput, toLines } from "../../editor-data";

export default async function QuotePage({ params }: PageProps<"/admin/cotizaciones/[id]">) {
  const { id } = await params;
  const [quote, lists] = await Promise.all([getQuote(id), getEditorLists()]);
  if (!quote) notFound();

  // Opening a proposal from the public builder takes it out of "Propuestas nuevas".
  if (quote.source === "PUBLIC" && !quote.seenAt) {
    await prisma.quote.update({ where: { id }, data: { seenAt: new Date() } });
  }

  return (
    <DocEditor
      key={quote.id}
      kind="quote"
      id={quote.id}
      number={quoteNumber(quote.number)}
      {...lists}
      fromPublic={quote.source === "PUBLIC"}
      invoiceId={quote.invoice?.id ?? null}
      initial={{
        clientId: quote.clientId,
        title: quote.title,
        discountPct: quote.discountPct,
        applyTax: quote.applyTax,
        notes: quote.notes,
        items: toLines(quote.items),
      }}
      quote={{
        status: quote.status as "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED",
        urgent: quote.urgent,
        validUntil: quote.validUntil ? toDateInput(quote.validUntil) : null,
      }}
    />
  );
}
