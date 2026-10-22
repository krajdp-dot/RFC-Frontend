"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchApi } from "@/lib/fetchApi";
import { formatCompact } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

// Mirrors backend/src/modules/intelligence/intelligence.service.ts's
// BriefSignal/DataBasis types exactly — this page never calculates
// anything itself, only renders what /intelligence/brief already
// decided (spec section 3: no fake intelligence in the frontend).
interface DataBasis {
  sufficiency: "VERIFIED" | "LIMITED" | "INSUFFICIENT";
  explanation: string;
}
interface BriefSignal {
  id: string;
  type: string;
  tier: "ATTENTION" | "WATCH" | "HEALTHY";
  title: string;
  detail: string;
  href: string;
  basis: DataBasis;
}
interface PeriodFigure {
  label: string;
  [key: string]: unknown;
}
interface Brief {
  generatedAt: string;
  needsAttention: BriefSignal[];
  watch: BriefSignal[];
  healthy: BriefSignal[];
  trends: {
    sales: { currentPeriod: PeriodFigure; previousPeriod: PeriodFigure; changePct: number | null; basis: DataBasis };
    margin: { currentPeriod: PeriodFigure; previousPeriod: PeriodFigure; marginPtChange: number | null; basis: DataBasis };
    wastage: { currentPeriod: PeriodFigure; previousPeriod: PeriodFigure; basis: DataBasis };
    expenses: { currentPeriod: PeriodFigure; previousPeriod: PeriodFigure; changePct: number | null };
  };
}

const TIER_STYLE = {
  ATTENTION: { dot: "bg-red-500", iconWrap: "bg-red-100 text-red-600", Icon: AlertCircle, pulse: true },
  WATCH: { dot: "bg-amber-500", iconWrap: "bg-amber-100 text-amber-600", Icon: AlertTriangle, pulse: false },
  HEALTHY: { dot: "bg-emerald-500", iconWrap: "bg-emerald-100 text-emerald-600", Icon: CheckCircle2, pulse: false },
} as const;

function SignalGroup({
  tier,
  title,
  signals,
  emptyTitle,
  emptyDescription,
}: {
  tier: keyof typeof TIER_STYLE;
  title: string;
  signals: BriefSignal[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  const style = TIER_STYLE[tier];
  const { Icon } = style;
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center gap-2">
        {signals.length > 0 && (
          <span className={cn("w-2 h-2 rounded-full shrink-0", style.dot, style.pulse && "animate-pulse")} />
        )}
        <h2 className="text-sm font-semibold tracking-tight text-foreground grow">{title}</h2>
        {signals.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{signals.length}</span>
        )}
      </div>
      <div className="flex flex-col divide-y">
        {signals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="text-xs mt-1">{emptyDescription}</p>
          </div>
        ) : (
          signals.map((s) => (
            <Link
              key={s.id}
              href={s.href || "#"}
              className="p-4 flex items-start gap-3 group hover:bg-muted/30 transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", style.iconWrap)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="grow min-w-0">
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <p className="text-[11px] text-muted-foreground/70">{s.basis?.explanation}</p>
                  {s.basis?.sufficiency === "LIMITED" && <StatusBadge variant="watch" label="Limited data" />}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function TrendTile({
  label,
  current,
  previousLabel,
  changeText,
  positive,
  href,
}: {
  label: string;
  current: string;
  previousLabel: string;
  changeText: string;
  positive: boolean | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-white shadow-sm p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors min-w-0"
    >
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-lg font-bold tracking-tight tabular-nums">{current}</span>
        <span
          className={cn(
            "text-[11px] font-medium flex items-center gap-0.5",
            positive === null ? "text-muted-foreground" : positive ? "text-emerald-600" : "text-red-500"
          )}
        >
          {positive === true && <TrendingUp className="w-3 h-3" />}
          {positive === false && <TrendingDown className="w-3 h-3" />}
          {changeText}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground truncate">{previousLabel}</span>
    </Link>
  );
}

export default function IntelligencePage() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchApi("/intelligence/brief");
      setBrief(data);
    } catch (err: any) {
      setError(err.message || "Failed to load intelligence");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !brief) {
    return (
      <div className="space-y-5 pb-12">
        <PageHeader title="Intelligence" subtitle="Your morning briefing across the whole business." />
        <div className="p-12 text-center text-muted-foreground">Reading the ledger…</div>
      </div>
    );
  }

  if (error && !brief) {
    return (
      <div className="space-y-5 pb-12">
        <PageHeader title="Intelligence" subtitle="Your morning briefing across the whole business." />
        <div className="p-12 text-center text-destructive rounded-xl border border-border bg-white shadow-sm">{error}</div>
      </div>
    );
  }

  if (!brief) return null;

  const generatedTime = new Date(brief.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const sales = brief.trends.sales;
  const salesChange = sales.changePct === null
    ? { text: "Not enough history yet", positive: null as boolean | null }
    : { text: `${sales.changePct > 0 ? "+" : ""}${sales.changePct.toFixed(1)}%`, positive: sales.changePct > 0 };

  const margin = brief.trends.margin;
  const marginChange = margin.marginPtChange === null
    ? { text: "Not enough history yet", positive: null as boolean | null }
    : { text: `${margin.marginPtChange > 0 ? "+" : ""}${margin.marginPtChange.toFixed(1)}pt`, positive: margin.marginPtChange > 0 };

  const wastage = brief.trends.wastage;
  const currentWasteRate = wastage.currentPeriod.ratePct as number | null;
  const previousWasteRate = wastage.previousPeriod.ratePct as number | null;
  const wastageChange = currentWasteRate === null || previousWasteRate === null
    ? { text: "Not enough history yet", positive: null as boolean | null }
    : { text: `${currentWasteRate <= previousWasteRate ? "" : "+"}${(currentWasteRate - previousWasteRate).toFixed(1)}pt`, positive: currentWasteRate < previousWasteRate };

  const expenses = brief.trends.expenses;
  const expensesChange = expenses.changePct === null
    ? { text: "Not enough history yet", positive: null as boolean | null }
    : { text: `${expenses.changePct > 0 ? "+" : ""}${expenses.changePct.toFixed(1)}%`, positive: expenses.changePct <= 0 };

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Intelligence"
        subtitle={`Your morning briefing across the whole business · updated ${generatedTime}`}
        secondaryActions={[{ label: "Refresh", icon: RefreshCw, onClick: load }]}
      />

      <MetricStrip
        metrics={[
          { label: "Needs Attention", value: String(brief.needsAttention.length) },
          { label: "Watch", value: String(brief.watch.length) },
          { label: "Healthy", value: String(brief.healthy.length) },
        ]}
      />

      <SignalGroup
        tier="ATTENTION"
        title="Needs Attention"
        signals={brief.needsAttention}
        emptyTitle="Nothing needs attention right now"
        emptyDescription="No high-priority operational risks were found in the current data."
      />

      <SignalGroup
        tier="WATCH"
        title="Watch"
        signals={brief.watch}
        emptyTitle="Nothing material to watch"
        emptyDescription="No meaningful changes in stock, margin, wastage or expenses right now."
      />

      <SignalGroup
        tier="HEALTHY"
        title="Healthy"
        signals={brief.healthy}
        emptyTitle="No positive signals yet"
        emptyDescription="As more sales and collections history builds up, wins will show up here."
      />

      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground mb-3">Trends</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <TrendTile
            label="Sales"
            current={formatCompact(Number((sales.currentPeriod as any).total))}
            previousLabel={`Was ${formatCompact(Number((sales.previousPeriod as any).total))}`}
            changeText={salesChange.text}
            positive={salesChange.positive}
            href="/reports"
          />
          <TrendTile
            label="Gross Margin"
            current={`${(margin.currentPeriod as any).marginPct.toFixed(1)}%`}
            previousLabel={`Was ${(margin.previousPeriod as any).marginPct.toFixed(1)}%`}
            changeText={marginChange.text}
            positive={marginChange.positive}
            href="/reports"
          />
          <TrendTile
            label="Wastage Rate"
            current={currentWasteRate === null ? "No data" : `${currentWasteRate.toFixed(1)}%`}
            previousLabel={previousWasteRate === null ? "No prior data" : `Was ${previousWasteRate.toFixed(1)}%`}
            changeText={wastageChange.text}
            positive={wastageChange.positive}
            href="/inventory/wastage"
          />
          <TrendTile
            label="Expenses"
            current={formatCompact(Number((expenses.currentPeriod as any).total))}
            previousLabel={`Was ${formatCompact(Number((expenses.previousPeriod as any).total))}`}
            changeText={expensesChange.text}
            positive={expensesChange.positive}
            href="/expenses"
          />
        </div>
      </div>
    </div>
  );
}
