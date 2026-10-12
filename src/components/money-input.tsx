"use client";

import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface MoneyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | null;
  onChange: (value: number | null) => void;
  currency?: string;
}

const display = (v: number | null) => (v === null || Number.isNaN(v) ? "" : v.toFixed(2));

/** "1,299.90" → 1299.9 · "" → null · garbage → NaN (fails validation). */
function parse(raw: string): number | null {
  const normalized = raw.replace(/[\s,]/g, "");
  if (normalized === "") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : Number.NaN;
}

/** Amount in dollars (e.g. 29.9). Empty → null. */
export function MoneyInput({ value, onChange, onBlur, onFocus, currency = "USD", ...props }: MoneyInputProps) {
  const [text, setText] = useState(display(value));
  const [lastValue, setLastValue] = useState(value);

  // Sync when the value changes from outside (e.g. form reset).
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== parse(text)) setText(display(value));
  }

  return (
    <InputGroup>
      <InputGroupInput
        inputMode="decimal"
        placeholder="0.00"
        {...props}
        value={text}
        onFocus={(e) => {
          e.currentTarget.select(); // typing replaces "0.00" instead of appending to it
          onFocus?.(e);
        }}
        onChange={(e) => {
          if (!/^[\d\s.,]*$/.test(e.target.value)) return;
          setText(e.target.value);
          onChange(parse(e.target.value));
        }}
        onBlur={(e) => {
          const parsed = parse(text);
          if (parsed !== null && !Number.isNaN(parsed)) setText(parsed.toFixed(2));
          onBlur?.(e);
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{currency}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
