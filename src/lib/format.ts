const dateFmt = new Intl.DateTimeFormat("es-DO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});
const shortFmt = new Intl.DateTimeFormat("es-DO", {
  day: "numeric",
  month: "short",
  timeZone: "America/Santo_Domingo",
});
const longFmt = new Intl.DateTimeFormat("es-DO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Santo_Domingo",
});

const clean = (s: string) => s.replace(/\./g, "").replace(/ de /g, " ");

/** "13 nov 2026" */
export const formatDate = (d: Date) => clean(dateFmt.format(d));
/** "13 nov" */
export const formatDateShort = (d: Date) => clean(shortFmt.format(d));
/** "Jueves, 13 de noviembre" */
export function formatDateLong(d: Date) {
  const s = longFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Hace 2 h", "Ayer", "12 nov 2026" */
export function formatRelative(d: Date, now = new Date()) {
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  if (hours < 48) return "Ayer";
  return formatDate(d);
}

export const quoteNumber = (n: number) => `COT-${String(n).padStart(4, "0")}`;
export const invoiceNumber = (n: number) => `FAC-${String(n).padStart(4, "0")}`;

/** "Café Colonial" -> "CC" */
export function initials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w));
  const picked = words.length > 1 ? [words[0], words[1]] : [words[0] ?? "?"];
  return picked
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_TONES = [
  ["#EAF2FE", "#2C6FD8"],
  ["#F3EAFE", "#7A3FD1"],
  ["#FFF4E5", "#B4690E"],
  ["#E9F8EF", "#1E8A4C"],
  ["#FDEDED", "#C53030"],
  ["#F1F2F4", "#5B6070"],
] as const;

/** Stable soft color per name, for avatars. */
export function avatarTone(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [bg, fg] = AVATAR_TONES[h % AVATAR_TONES.length];
  return { bg, fg };
}
