"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NativeInputProps = React.ComponentProps<"input">;

export type NumberInputProps = Omit<
  NativeInputProps,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> & {
  value: number | string | null | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** Most entry forms start at 0; render that as an empty field with a 0 hint. */
  emptyWhenZero?: boolean;
};

function numericValue(value: number | string | null | undefined): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function displayValue(
  value: number | string | null | undefined,
  emptyWhenZero: boolean,
): string {
  const parsed = numericValue(value);
  if (parsed === null || (emptyWhenZero && parsed === 0)) return "";
  return String(value);
}

function cleanDraft(value: string): string {
  if (value === "" || value === "-" || value === "." || value === "-.") return "";
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [integerPart, decimalPart, ...rest] = unsigned.split(".");
  let integer = integerPart.replace(/^0+(?=\d)/, "");
  if (integer === "" && decimalPart !== undefined) integer = "0";
  if (integer === "") integer = "0";
  const decimal = decimalPart !== undefined ? `.${decimalPart}${rest.length ? `.${rest.join(".")}` : ""}` : "";
  const result = `${negative ? "-" : ""}${integer}${decimal}`;
  return result === "0" && value.startsWith("-") ? "-0" : result;
}

function rangeMessage(
  draft: string,
  min?: number | string,
  max?: number | string,
  step?: number | string,
): string {
  if (!draft || draft === "-" || draft === "." || draft === "-.") return "";
  const value = Number(draft);
  if (!Number.isFinite(value)) return "Enter a valid number.";

  const minValue = min === undefined || min === "" ? undefined : Number(min);
  const maxValue = max === undefined || max === "" ? undefined : Number(max);
  if (minValue !== undefined && Number.isFinite(minValue) && value < minValue) {
    return `Enter ${minValue} or more.`;
  }
  if (maxValue !== undefined && Number.isFinite(maxValue) && value > maxValue) {
    return `Enter ${maxValue} or less.`;
  }

  const effectiveStep = step === undefined || step === "" ? 1 : step;
  if (effectiveStep !== "any") {
    const increment = Number(effectiveStep);
    if (Number.isFinite(increment) && increment > 0) {
      const base = minValue !== undefined && Number.isFinite(minValue) ? minValue : 0;
      const units = (value - base) / increment;
      if (Math.abs(units - Math.round(units)) > 1e-7) {
        return `Use increments of ${increment}.`;
      }
    }
  }
  return "";
}

/**
 * A compact numeric field for quantities, box counts, prices and payments.
 * It keeps a text draft while editing, so typing 0.50 or replacing an initial
 * zero never gets interrupted by parent-state number coercion. Leading zeros
 * are removed as digits are entered; number/min/max/step validation is retained.
 */
export function NumberInput({
  value,
  onChange,
  onFocus,
  onBlur,
  min,
  max,
  step,
  emptyWhenZero = true,
  inputMode,
  placeholder,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: NumberInputProps) {
  const focused = useRef(false);
  const [draft, setDraft] = useState(() => displayValue(value, emptyWhenZero));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!focused.current) setDraft(displayValue(value, emptyWhenZero));
  }, [value, emptyWhenZero]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const raw = event.currentTarget.value;
    // Keep the entry unambiguous. This field intentionally excludes thousands
    // separators and currency symbols; the unit/currency is shown outside it.
    if (!/^-?\d*\.?\d*$/.test(raw)) return;

    const next = cleanDraft(raw);
    setDraft(next);
    const nextError = rangeMessage(next, min, max, step);
    setError(nextError);
    event.currentTarget.setCustomValidity(nextError);
    onChange?.(event);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    focused.current = true;
    if (emptyWhenZero && numericValue(value) === 0) setDraft("");
    onFocus?.(event);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    const nextError = rangeMessage(draft, min, max, step);
    setError(nextError);
    event.currentTarget.setCustomValidity(nextError);
    const cleaned = cleanDraft(draft);
    setDraft(displayValue(cleaned, emptyWhenZero));
    focused.current = false;
    onBlur?.(event);
  };

  const mode = inputMode ?? (
    (step === undefined || Number(step) === 1) ? "numeric" : "decimal"
  );

  return (
    <Input
      {...props}
      type="text"
      inputMode={mode}
      value={draft}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder ?? (emptyWhenZero ? "0" : undefined)}
      aria-invalid={Boolean(error) || ariaInvalid || undefined}
      title={error || props.title}
      className={cn(
        "text-right font-medium tabular-nums tracking-tight",
        "selection:bg-primary/15",
        className,
      )}
      required={props.required}
    />
  );
}
