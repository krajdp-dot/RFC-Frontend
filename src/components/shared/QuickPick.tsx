"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickPickOption = {
  value: string;
  label: string;
  detail?: string;
  meta?: string;
  disabled?: boolean;
  icon?: LucideIcon;
};

type QuickPickProps = {
  value: string;
  onChange: (value: string) => void;
  options: QuickPickOption[];
  label?: string;
  hint?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  mode?: "grid" | "list" | "segments";
  columns?: 1 | 2 | 3 | 4;
  searchable?: boolean;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
  optionClassName?: string;
};

/**
 * A card/row based alternative to native select menus for frequently used
 * choices. Options remain visible and discoverable, with optional search,
 * so staff can choose with one tap instead of opening long dropdowns.
 */
export function QuickPick({
  value,
  onChange,
  options,
  label,
  hint,
  placeholder = "Search options…",
  searchPlaceholder,
  emptyText = "No matching options found.",
  mode = "grid",
  columns = 3,
  searchable = true,
  maxVisible = 6,
  disabled = false,
  className,
  optionClassName,
}: QuickPickProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      [option.label, option.detail, option.meta]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q)),
    );
  }, [options, query]);

  const visible = query.trim() || showAll ? filtered : filtered.slice(0, maxVisible);
  const selected = options.find((option) => option.value === value);
  const hiddenCount = Math.max(0, filtered.length - visible.length);

  const gridCols: Record<1 | 2 | 3 | 4, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {(label || hint) && (
        <div className="flex min-w-0 flex-col gap-0.5">
          {label && <div className="text-sm font-semibold tracking-tight">{label}</div>}
          {hint && <div className="text-xs leading-5 text-muted-foreground">{hint}</div>}
        </div>
      )}

      {searchable && options.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAll(false);
            }}
            placeholder={searchPlaceholder || placeholder}
            disabled={disabled}
            autoComplete="off"
            aria-label={label ? `Search ${label.toLowerCase()}` : "Search options"}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/80 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      {selected && mode !== "segments" && (
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="shrink-0">Selected</span>
          <span className="truncate rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 font-semibold text-primary">
            {selected.label}
          </span>
          {selected.meta && <span className="hidden truncate sm:inline">{selected.meta}</span>}
        </div>
      )}

      {visible.length > 0 ? (
        <div className={cn(
          mode === "segments"
            ? "flex flex-wrap gap-2"
            : mode === "list"
              ? "flex flex-col gap-2"
              : cn("grid gap-2.5", gridCols[columns]),
        )}>
          {visible.map((option) => {
            const isSelected = option.value === value;
            const Icon = option.icon;
            if (mode === "segments") {
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled || option.disabled}
                  aria-pressed={isSelected}
                  onClick={() => onChange(option.value)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    isSelected
                      ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted/50",
                    optionClassName,
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            }

            if (mode === "list") {
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled || option.disabled}
                  aria-pressed={isSelected}
                  onClick={() => onChange(option.value)}
                  className={cn(
                    "group flex min-h-[58px] w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    isSelected
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/30",
                    optionClassName,
                  )}
                >
                  <span className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}>
                    {Icon ? <Icon className="h-4 w-4" /> : <span className="text-sm font-bold">{option.label.trim().slice(0, 1).toUpperCase()}</span>}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">{option.label}</span>
                    {option.detail && <span className="truncate text-xs text-muted-foreground">{option.detail}</span>}
                  </span>
                  {option.meta && <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{option.meta}</span>}
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent group-hover:border-primary/40",
                  )}>
                    <Check className="h-3 w-3" />
                  </span>
                </button>
              );
            }

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled || option.disabled}
                aria-pressed={isSelected}
                onClick={() => onChange(option.value)}
                className={cn(
                  "group relative flex min-h-[92px] min-w-0 flex-col items-start rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/15"
                    : "border-border bg-background hover:border-primary/35",
                  optionClassName,
                )}
              >
                <span className={cn(
                  "mb-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}>
                  {Icon ? <Icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>
                <span className="line-clamp-2 pr-4 text-sm font-semibold leading-5">{option.label}</span>
                {option.detail && <span className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{option.detail}</span>}
                {option.meta && <span className="mt-auto pt-2 text-xs font-semibold text-muted-foreground">{option.meta}</span>}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}

      {!query.trim() && !showAll && hiddenCount > 0 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowAll(true)}
          className="mx-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-50"
        >
          View all {filtered.length} options
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
