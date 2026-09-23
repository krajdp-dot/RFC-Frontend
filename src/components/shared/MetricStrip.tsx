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
    <div className={cn("bg-card border rounded-xl p-1 flex flex-wrap", className)}>
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
              "flex-1 min-w-[140px] px-4 py-3 flex flex-col gap-0.5",
              i > 0 && "border-l"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {m.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight tabular-nums">{m.value}</span>
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
              <span className="text-[11px] text-muted-foreground">{m.subtext}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
