"use client";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  loading,
  empty,
  error,
  emptyMessage = "No data available for this period.",
  errorMessage = "Chart couldn't be loaded.",
  headerRight,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn("bg-card border rounded-xl overflow-hidden flex flex-col", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {headerRight}
      </div>

      <div className="p-4 flex-1 min-h-[200px] flex items-center justify-center">
        {loading ? (
          <div className="w-full space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted/50 rounded" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{errorMessage}</p>
            <button className="text-sm text-primary hover:underline mt-1">Try again</button>
          </div>
        ) : empty ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </div>
  );
}
