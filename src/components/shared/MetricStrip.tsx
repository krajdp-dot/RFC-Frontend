import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: string | { value: string; positive: boolean };
}

interface MetricStripProps {
  metrics: Metric[];
  className?: string;
}

export function MetricStrip({ metrics, className }: MetricStripProps) {
  return (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3", className)}>
      {metrics.map((m, i) => {
        // Normalize trend: accept string like "↑ 12%" or structured object
        let trendDisplay: { text: string; positive: boolean } | null = null;
        if (m.trend) {
          if (typeof m.trend === 'string') {
            const isPositive = m.trend.includes('↑') || m.trend.includes('+');
            trendDisplay = { text: m.trend, positive: isPositive };
          } else {
            trendDisplay = { text: `${m.trend.positive ? '↑' : '↓'} ${m.trend.value}`, positive: m.trend.positive };
          }
        }

        return (
          <div
            key={i}
            className={cn(
              "min-w-0 rounded-2xl border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(22,33,27,0.025)] transition hover:border-primary/20 hover:shadow-sm"
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-muted-foreground">
              {m.label}
            </span>{m.icon && <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 text-primary"><m.icon className="h-4 w-4" /></span>}</div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[25px] font-semibold leading-tight tracking-[-0.035em] tabular-nums">{m.value}</span>
              {trendDisplay && (
                <span className={cn(
                  "text-[11px] font-medium",
                  trendDisplay.positive ? "text-emerald-600" : "text-red-500"
                )}>
                  {trendDisplay.text}
                </span>
              )}
            </div>
            {m.subtext && (
              <span className="mt-2 block text-xs text-muted-foreground">{m.subtext}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
