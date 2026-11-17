// Builds the prefilled WhatsApp message. Shared by the public builder and the admin.

export const DEFAULT_TEMPLATE = [
  "¡Hola Priscila! Soy {cliente} ({negocio}). Quiero cotizar:",
  "",
  "🖥️ {proyecto}",
  "{extras}",
  "",
  "Plazo: {plazo}",
  "💰 Total estimado: {total}",
  "{mensual}",
  "📝 {nota}",
].join("\n");

export const TEMPLATE_VARIABLES = [
  "{cliente}",
  "{negocio}",
  "{proyecto}",
  "{extras}",
  "{plazo}",
  "{total}",
  "{mensual}",
  "{nota}",
] as const;

export type MessageValues = {
  cliente: string;
  negocio: string;
  proyecto: string; // "Página web — RD$30,000"
  extras: string[]; // already formatted lines, "3 páginas adicionales — RD$9,000"
  plazo: string;
  total: string;
  mensual: string; // "Mantenimiento: RD$3,000/mes (aparte)" or ""
  nota: string;
};

/**
 * Fills the template. A line whose placeholders are all empty is dropped,
 * and an empty "({negocio})" disappears, so optional fields never leave gaps.
 */
export function fillTemplate(template: string, v: MessageValues): string {
  const map: Record<string, string> = {
    cliente: v.cliente.trim(),
    negocio: v.negocio.trim(),
    proyecto: v.proyecto,
    extras: v.extras.map((e) => `• ${e}`).join("\n"),
    plazo: v.plazo,
    total: v.total,
    mensual: v.mensual,
    nota: v.nota.trim(),
  };
  const lines = template.split("\n").flatMap((line) => {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    if (keys.length > 0 && keys.every((k) => !map[k])) return [];
    const filled = line
      .replace(/\s*\(\{negocio\}\)/g, map.negocio ? ` (${map.negocio})` : "")
      .replace(/\{(\w+)\}/g, (_, k: string) => map[k] ?? "");
    return [filled];
  });
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Dominican numbers: 809/829/849 + 7 digits get the country code 1. */
export function phoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // 10 digits = North American number (RD 809/829/849, EE. UU., …): add the country code 1.
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phoneForWhatsApp(phone)}?text=${encodeURIComponent(text)}`;
}
