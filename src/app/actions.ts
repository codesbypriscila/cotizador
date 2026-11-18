"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { businessNameError, emailError, personNameError, phoneError, tidy } from "@/lib/validation";

const schema = z.object({
  projectId: z.string().min(1),
  extras: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().min(1).max(50) })).max(30),
  name: z
    .string()
    .transform(tidy)
    .superRefine((v, ctx) => {
      const error = personNameError(v);
      if (error) ctx.addIssue({ code: "custom", message: error });
    }),
  business: z
    .string()
    .transform(tidy)
    .superRefine((v, ctx) => {
      const error = businessNameError(v);
      if (error) ctx.addIssue({ code: "custom", message: error });
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .superRefine((v, ctx) => {
      const error = v ? emailError(v) : "Escribe tu correo.";
      if (error) ctx.addIssue({ code: "custom", message: error });
    }),
  phone: z
    .string()
    .transform(tidy)
    .superRefine((v, ctx) => {
      const error = phoneError(v, { required: true });
      if (error) ctx.addIssue({ code: "custom", message: error });
    }),
  urgent: z.boolean(),
  note: z.string().trim().max(1000),
  website: z.string().max(0), // honeypot: real people leave it empty
  currency: z.enum(["USD", "DOP"]),
});

export type ProposalInput = z.input<typeof schema>;

/**
 * Saves a proposal from the public builder so it shows up in the admin as
 * "Propuestas nuevas". Prices are read again from the catalog; the client's
 * numbers are never trusted. The same checks run in the browser before the email opens.
 */
export async function submitProposal(input: ProposalInput): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    return {
      ok: false,
      error: ["name", "business", "email", "phone"].includes(String(field))
        ? issue.message
        : "Revisa tus datos e inténtalo otra vez.",
    };
  }
  const data = parsed.data;

  const ids = [data.projectId, ...data.extras.map((e) => e.id)];
  // Required extras (like monthly maintenance) always go in, even if the browser left them out.
  const items = await prisma.catalogItem.findMany({
    where: { visible: true, OR: [{ id: { in: ids } }, { kind: "EXTRA", required: true }] },
    orderBy: { sortOrder: "asc" },
  });
  const project = items.find((i) => i.id === data.projectId && i.kind === "PROJECT");
  if (!project) return { ok: false, error: "Ese tipo de proyecto ya no está disponible. Elige otro." };

  const extras = items
    .filter((i) => i.kind === "EXTRA")
    .flatMap((item) => {
      const chosen = data.extras.find((e) => e.id === item.id);
      if (!chosen && !item.required) return [];
      return [{ item, quantity: item.unit === "EACH" ? (chosen?.quantity ?? 1) : 1 }];
    });

  const clientName = data.business || data.name;
  const existing = await prisma.client.findFirst({
    where: { name: { equals: clientName, mode: "insensitive" }, contact: { equals: data.name, mode: "insensitive" } },
  });
  // Keep the newest email and WhatsApp the client typed.
  const contactData = { email: data.email, phone: data.phone };
  const client = existing
    ? await prisma.client.update({ where: { id: existing.id }, data: contactData })
    : await prisma.client.create({ data: { name: clientName, contact: data.business ? data.name : "", ...contactData } });

  const countable = extras.filter((e) => e.item.unit !== "MONTHLY").length;
  await prisma.quote.create({
    data: {
      clientId: client.id,
      title: countable ? `${project.name} · ${countable} ${countable === 1 ? "extra" : "extras"}` : project.name,
      status: "SENT",
      source: "PUBLIC",
      urgent: data.urgent,
      currency: data.currency,
      notes: data.note,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { name: project.name, description: project.description, icon: project.icon, unitPrice: project.price, sortOrder: 0 },
          ...extras.map((e, i) => ({
            name: e.item.name,
            description: e.item.description,
            icon: e.item.icon,
            quantity: e.quantity,
            unitPrice: e.item.price,
            unit: e.item.unit,
            sortOrder: i + 1,
          })),
        ],
      },
    },
  });
  return { ok: true };
}
