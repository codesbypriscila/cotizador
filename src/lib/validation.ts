// Field rules shared by the forms (instant feedback) and the server actions (final word).

/** Collapses repeated spaces and trims. */
export const tidy = (s: string) => s.replace(/\s+/g, " ").trim();

/** Person names: letters (with accents and ñ) and spaces only. */
const PERSON_NAME = /^\p{L}+(?: \p{L}+)*$/u;
/** Business names also allow numbers and . , & ' - */
const BUSINESS_NAME = /^[\p{L}\p{N}][\p{L}\p{N} .,&'’-]*$/u;

export function personNameError(raw: string): string | null {
  const v = tidy(raw);
  if (!v) return "Escribe tu nombre.";
  if (v.length < 2) return "El nombre es muy corto.";
  if (v.length > 60) return "El nombre es muy largo (máximo 60 letras).";
  if (!PERSON_NAME.test(v)) return "Usa solo letras y espacios, sin números ni símbolos.";
  return null;
}

export function businessNameError(raw: string): string | null {
  const v = tidy(raw);
  if (!v) return "Escribe el nombre de tu negocio.";
  if (v.length < 2) return "El nombre del negocio es muy corto.";
  if (v.length > 80) return "El nombre del negocio es muy largo (máximo 80).";
  if (!BUSINESS_NAME.test(v)) return "Usa letras, números y solo estos signos: . , & ' -";
  return null;
}

/** Phone for WhatsApp: 10 to 15 digits once spaces, dashes and parentheses are removed. */
export function phoneError(raw: string, { required = false } = {}): string | null {
  const v = raw.trim();
  if (!v) return required ? "Escribe el número de WhatsApp." : null;
  if (!/^\+?[\d\s().-]+$/.test(v)) return "Usa solo números (puede llevar +, espacios o guiones).";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "Debe tener entre 10 y 15 dígitos, con código de área.";
  return null;
}

export function emailError(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Ese correo no parece válido.";
}
