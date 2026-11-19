import "server-only";
import { getInvoices } from "@/lib/data";
import { prisma } from "@/lib/prisma";

/** Clients with billed / collected / pending totals and their worst invoice status. */
export async function getClientsWithBalance() {
  const [clients, invoices, quotes] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
    getInvoices(),
    prisma.quote.findMany({ select: { clientId: true, status: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return clients.map((c) => {
    const mine = invoices.filter((i) => i.clientId === c.id && i.status !== "DRAFT");
    const billed = mine.reduce((s, i) => s + i.total, 0);
    const paid = mine.reduce((s, i) => s + i.paid, 0);
    const overdue = mine.some((i) => i.status === "OVERDUE");
    const lastQuote = quotes.find((q) => q.clientId === c.id);
    const balanceLabel =
      mine.length === 0
        ? lastQuote
          ? {
              PENDING: "Cotización pendiente",
              ACCEPTED: "Cotización aceptada",
              REJECTED: "Cotización rechazada",
              SENT: "Cotización enviada",
              DRAFT: "Cotización en borrador",
            }[lastQuote.status]
          : "Sin facturas"
        : overdue
          ? "Vencida"
          : billed - paid > 0
            ? "Debe"
            : "Al día";
    return { ...c, billed, paid, pending: billed - paid, overdue, balanceLabel };
  });
}
export type ClientWithBalance = Awaited<ReturnType<typeof getClientsWithBalance>>[number];
