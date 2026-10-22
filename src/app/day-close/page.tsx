"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertTriangle, Lock } from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";

function formatCurrency(amount: string | number | null | undefined) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DayClosePage() {
  const [businessDate, setBusinessDate] = useState(todayStr());
  const [physicalCash, setPhysicalCash] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");
  const [closeResult, setCloseResult] = useState<any>(null);

  async function loadPreview() {
    try {
      setLoading(true);
      setError("");
      setCloseResult(null);
      const params = physicalCash ? `?physicalCash=${physicalCash}` : "";
      const res = await fetchApi(`/day-close/${businessDate}/preview${params}`);
      setPreview(res);
    } catch (err: any) {
      setError(err.message || "Failed to load day close preview");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessDate]);

  async function handleClose() {
    if (closing) return;
    setClosing(true);
    setCloseError("");
    try {
      const result = await fetchApi("/day-close", {
        method: "POST",
        body: JSON.stringify({
          businessDate,
          physicalCash: physicalCash ? Number(physicalCash) : undefined,
          notes: notes || undefined,
        }),
      });
      setCloseResult(result);
      await loadPreview();
    } catch (err: any) {
      // Section 23 / 18: a BUSINESS_DATE_CLOSED conflict (e.g. someone else
      // closed it a moment ago) surfaces its real message rather than a
      // generic failure.
      setCloseError(err.message || "Failed to close business day");
    } finally {
      setClosing(false);
    }
  }

  const alreadyClosed = preview?.alreadyClosed;
  const existing = preview?.existing;
  const warnings = preview?.reconciliationWarnings || [];

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Day Close"
        subtitle="Reconcile and lock a business date so it can no longer be edited."
      />

      <div className="rounded-xl border border-border bg-white shadow-sm p-5 flex items-center gap-4">
        <label className="text-sm font-medium">Business Date</label>
        <Input
          type="date"
          className="w-48"
          value={businessDate}
          max={todayStr()}
          onChange={(e) => {
            setBusinessDate(e.target.value);
            setPhysicalCash("");
            setCloseResult(null);
          }}
        />
        {alreadyClosed && (
          <span className="ml-auto">
            <StatusBadge label="Closed" variant="success" />
          </span>
        )}
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
      {!loading && error && (
        <div className="p-8 text-center text-destructive">
          <p>{error}</p>
          <button type="button" onClick={loadPreview} className="mt-3 underline">Try again</button>
        </div>
      )}

      {!loading && !error && alreadyClosed && existing && (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Lock className="w-4 h-4" />
            <p className="font-medium">This business date is already closed.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Expected Cash</p>
              <p className="font-semibold tabular-nums">{formatCurrency(existing.expectedCash)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Physical Cash</p>
              <p className="font-semibold tabular-nums">{formatCurrency(existing.physicalCash)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Variance</p>
              <p className={`font-semibold tabular-nums ${Number(existing.difference) !== 0 ? "text-amber-600" : ""}`}>
                {existing.difference != null ? formatCurrency(existing.difference) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Sales</p>
              <p className="font-semibold tabular-nums">{formatCurrency(existing.salesTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchases</p>
              <p className="font-semibold tabular-nums">{formatCurrency(existing.purchasesTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expenses</p>
              <p className="font-semibold tabular-nums">{formatCurrency(existing.expensesTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Closed {existing.closedAt ? new Date(existing.closedAt).toLocaleString() : ""}
          </p>
        </div>
      )}

      {!loading && !error && !alreadyClosed && preview && (
        <>
          <div className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Cash Breakdown (Cash Accounts Only)</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Opening Cash</span>
              <span className="text-right tabular-nums">{formatCurrency(preview.breakdown.openingPhysicalCash)}</span>
              <span className="text-muted-foreground">+ Received from Customers</span>
              <span className="text-right tabular-nums text-emerald-600">+{formatCurrency(preview.breakdown.cashReceived)}</span>
              <span className="text-muted-foreground">− Paid to Suppliers</span>
              <span className="text-right tabular-nums text-red-500">−{formatCurrency(preview.breakdown.cashPaidToSuppliers)}</span>
              <span className="text-muted-foreground">− Expenses</span>
              <span className="text-right tabular-nums text-red-500">−{formatCurrency(preview.breakdown.cashExpenses)}</span>
              <span className="text-muted-foreground">− Deposited to Bank/Other</span>
              <span className="text-right tabular-nums text-red-500">−{formatCurrency(preview.breakdown.cashDeposits)}</span>
              <span className="text-muted-foreground">+ Withdrawn from Bank/Other</span>
              <span className="text-right tabular-nums text-emerald-600">+{formatCurrency(preview.breakdown.cashWithdrawals)}</span>
              <span className="text-muted-foreground">+ Refunds Received</span>
              <span className="text-right tabular-nums text-emerald-600">+{formatCurrency(preview.breakdown.cashRefundsIn)}</span>
              <span className="text-muted-foreground">− Refunds Paid Out</span>
              <span className="text-right tabular-nums text-red-500">−{formatCurrency(preview.breakdown.cashRefundsOut)}</span>
              <span className="font-semibold border-t pt-3">Expected Closing Cash</span>
              <span className="text-right font-semibold tabular-nums border-t pt-3">{formatCurrency(preview.breakdown.expectedClosingCash)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-white shadow-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Sales</p>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(preview.salesTotal)}</p>
            </div>
            <div className="rounded-xl border border-border bg-white shadow-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Purchases</p>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(preview.purchasesTotal)}</p>
            </div>
            <div className="rounded-xl border border-border bg-white shadow-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Wastage</p>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(preview.wastageTotal)}</p>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm">
                <AlertTriangle className="w-4 h-4" />
                Reconciliation warnings — review before closing
              </div>
              {warnings.map((w: any, i: number) => (
                <div key={i} className="text-sm text-amber-800 dark:text-amber-300">
                  <span className="font-medium">{w.name}:</span> {(w.discrepancies || []).join("; ")}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Count &amp; Close</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Physical Cash Counted</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={physicalCash}
                  onChange={(e) => setPhysicalCash(e.target.value)}
                  onBlur={loadPreview}
                />
              </div>
              {physicalCash && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Variance</label>
                  <p className={`h-10 flex items-center font-semibold tabular-nums ${preview.breakdown.variance && Number(preview.breakdown.variance) !== 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {formatCurrency(preview.breakdown.variance)}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional — e.g. explaining a variance)</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {closeError && <p className="text-sm text-destructive">{closeError}</p>}
            <p className="text-xs text-muted-foreground">
              Closing locks {businessDate} — no new sales, purchases, payments, or expenses can be recorded against it afterward.
            </p>
            <Button onClick={handleClose} disabled={closing} className="w-full sm:w-auto">
              {closing ? "Closing..." : `Close ${businessDate}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
