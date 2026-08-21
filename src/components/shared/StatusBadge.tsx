import { cn } from "@/lib/utils";

export type BadgeVariant =
  | 'fresh' | 'good' | 'watch' | 'markdown' | 'urgent' | 'likely_loss'
  | 'paid' | 'partial' | 'credit' | 'overdue'
  | 'healthy' | 'high' | 'critical'
  | 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  fresh: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  good: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  watch: "bg-amber-500/10 text-amber-700 border-amber-200",
  markdown: "bg-orange-500/10 text-orange-700 border-orange-200",
  urgent: "bg-red-500/10 text-red-700 border-red-200",
  likely_loss: "bg-red-500/15 text-red-800 border-red-300",
  paid: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  partial: "bg-amber-500/10 text-amber-700 border-amber-200",
  credit: "bg-blue-500/10 text-blue-700 border-blue-200",
  overdue: "bg-red-500/10 text-red-700 border-red-200",
  healthy: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  high: "bg-orange-500/10 text-orange-700 border-orange-200",
  critical: "bg-red-500/10 text-red-700 border-red-200",
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  warning: "bg-amber-500/10 text-amber-700 border-amber-200",
  danger: "bg-red-500/10 text-red-700 border-red-200",
  error: "bg-red-500/10 text-red-700 border-red-200",
  info: "bg-blue-500/10 text-blue-700 border-blue-200",
};

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  fresh: "Fresh",
  good: "Good",
  watch: "Watch",
  markdown: "Markdown",
  urgent: "Urgent",
  likely_loss: "Likely Loss",
  paid: "Paid",
  partial: "Partial",
  credit: "Credit",
  overdue: "Overdue",
  healthy: "Healthy",
  high: "High",
  critical: "Critical",
  error: "Error",
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  /** Alias for variant — some pages use `status` instead */
  status?: string;
  /** Alias for variant — some pages use `type` instead */
  type?: string;
  label?: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ variant, status, type, label, className, dot }: StatusBadgeProps) {
  // Resolve variant from variant, status, or type props
  const resolvedVariant: BadgeVariant = (variant || status || type || 'default') as BadgeVariant;
  // Fall back to 'default' if the resolved variant isn't recognized
  const safeVariant: BadgeVariant = resolvedVariant in variantStyles ? resolvedVariant : 'default';
  const displayLabel = label || variantLabels[safeVariant] || String(resolvedVariant);
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap",
      variantStyles[safeVariant],
      className
    )}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-emerald-500": ['fresh', 'good', 'paid', 'healthy', 'success'].includes(safeVariant),
        "bg-amber-500": ['watch', 'partial', 'warning', 'markdown'].includes(safeVariant),
        "bg-red-500": ['urgent', 'likely_loss', 'overdue', 'critical', 'danger', 'error'].includes(safeVariant),
        "bg-blue-500": ['credit', 'info'].includes(safeVariant),
        "bg-orange-500": ['high'].includes(safeVariant),
      })} />}
      {displayLabel}
    </span>
  );
}
