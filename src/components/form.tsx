import { cx } from "./ui";

/** Red asterisk for required fields. */
export function Req() {
  return (
    <span aria-hidden className="text-[#C53030]">
      *
    </span>
  );
}

export function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-ink-2">
      {children} {required && <Req />}
    </label>
  );
}

export function FieldError({ id, children }: { id: string; children?: string | null }) {
  if (!children) return null;
  return (
    <span id={id} className="text-xs font-medium text-[#C53030]">
      {children}
    </span>
  );
}

/** Extra classes for a field that has an error. */
export const invalid = (error?: string | null) => cx(error && "bg-[#FDF3F3] ring-2 ring-[#F5C6C6]");

export type FieldErrors<K extends string> = Partial<Record<K, string>>;
