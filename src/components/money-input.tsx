"use client";

import { useState } from "react";
import { centsToInput, parseUSD } from "@/lib/money";
import { cx } from "./ui";

/**
 * Dollar amount input. Admin amounts are always typed in US$.
 * Keeps the typed text while editing (so "12." works) and formats it on blur.
 * With `name`, a hidden input submits the value in cents.
 */
export function MoneyInput({
  value,
  onChange,
  name,
  className,
  inputClassName,
  label,
  placeholder,
  required,
}: {
  value?: number;
  onChange?: (cents: number) => void;
  name?: string;
  className?: string;
  inputClassName?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [text, setText] = useState(centsToInput(value ?? 0));
  const [focused, setFocused] = useState(false);
  const cents = parseUSD(text);
  const shown = focused ? text : centsToInput(value ?? cents);

  return (
    <span className={cx("flex items-center gap-1", className)}>
      <span className="text-muted">US$</span>
      <input
        aria-label={label}
        inputMode="decimal"
        value={shown}
        placeholder={placeholder}
        required={required}
        onFocus={() => {
          setText(centsToInput(value ?? cents));
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d.,]/g, "");
          setText(t);
          onChange?.(parseUSD(t));
        }}
        className={cx("w-full min-w-0 bg-transparent outline-none tabular-nums", inputClassName)}
      />
      {name && <input type="hidden" name={name} value={value ?? cents} />}
    </span>
  );
}
