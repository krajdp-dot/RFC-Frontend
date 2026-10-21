"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/fetchApi";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function SalesReturnsPage() {
  const [reference, setReference] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [sale, setSale] = useState<any>(null);

  // Per sale-item: quantity to return + reason
  const [returnLines, setReturnLines] = useState<Record<string, { quantity: string; reason: string; saleable: boolean }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim() || searching) return;
    setSearching(true);
    setSearchError("");
    setSale(null);
    setResult(null);
    try {
      const res = await fetchApi(`/sales?search=${encodeURIComponent(reference.trim())}&limit=5`);
      const list = Array.isArray(res) ? res : res?.data || [];
      const match = list.find((s: any) => s.saleReference?.toLowerCase() === reference.trim().toLowerCase()) || list[0];
      if (!match) {
        setSearchError("No sale found matching that reference or customer name.");
        return;
      }
      const full = await fetchApi(`/sales/${match.id}`);
      setSale(full);
      const initialLines: Record<string, { quantity: string; reason: string; saleable: boolean }> = {};
      for (const item of full.items || []) {
        initialLines[item.id] = { quantity: "", reason: "", saleable: true };
      }
      setReturnLines(initialLines);
    } catch (err: any) {
      setSearchError(err.message || "Failed to find sale");
    } finally {
      setSearching(false);
    }
  }

  function updateLine(itemId: string, field: "quantity" | "reason" | "saleable", value: string | boolean) {
    setReturnLines((current) => ({
      ...current,
      [itemId]: { ...current[itemId], [field]: value },
    }));
  }

  async function handleSubmit() {
    if (!sale || submitting) return;
    const items = Object.entries(returnLines)
      .filter(([, line]) => Number(line.quantity) > 0)
      .map(([saleItemId, line]) => ({
        saleItemId,
        quantity: Number(line.quantity),
        reason: line.reason || "Not specified",
        saleable: line.saleable,
      }));

    if (items.length === 0) {
      setSubmitError("Enter a quantity to return for at least one item.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetchApi("/sales/returns", {
        method: "POST",
        body: JSON.stringify({ saleId: sale.id, items, idempotencyKey }),
      });
      setResult(res);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to process return");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto pb-16">
      <PageHeader
        title="Sales Returns"
        subtitle="Process a customer return against an existing sale."
      />

      {!result && (
        <form onSubmit={handleSearch} className="rounded-2xl border border-border/80 bg-card shadow-sm p-5 flex items-center gap-3">
          <Input
            placeholder="Sale reference (e.g. SALE-1) or customer name"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Find Sale"}
          </Button>
        </form>
      )}
      {searchError && <p className="text-sm text-destructive">{searchError}</p>}

      {sale && !result && (
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="font-semibold">{sale.saleReference}</p>
              <p className="text-sm text-muted-foreground">
                {sale.customer?.name} · {new Date(sale.businessDate).toLocaleDateString()} · Total {formatCurrency(sale.total)}
              </p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b">
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Sold Qty</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2 w-28">Return Qty</th>
                <th className="text-left py-2 pl-3">Reason</th>
                <th className="text-center py-2">Sellable?</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(sale.items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2">{item.product?.name || "—"}</td>
                  <td className="py-2 text-right tabular-nums">{item.quantity} {item.unit}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(item.rate)}</td>
                  <td className="py-2 text-right">
                    <Input
                      type="number" min="0" max={item.quantity} step="0.01"
                      className="w-24 ml-auto"
                      value={returnLines[item.id]?.quantity || ""}
                      onChange={(e) => updateLine(item.id, "quantity", e.target.value)}
                    />
                  </td>
                  <td className="py-2 pl-3">
                    <Input
                      placeholder="e.g. damaged, wrong item"
                      value={returnLines[item.id]?.reason || ""}
                      onChange={(e) => updateLine(item.id, "reason", e.target.value)}
                    />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={returnLines[item.id]?.saleable ?? true}
                      onChange={(e) => updateLine(item.id, "saleable", e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground">
            &quot;Sellable&quot; means the returned stock goes back into inventory; uncheck it for damaged or spoiled goods.
          </p>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setSale(null); setReference(""); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Processing..." : "Process Return"}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-6 space-y-4">
          <p className="font-semibold text-emerald-600">Return processed.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Returned Value</p>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.totalReturnAmount ?? result.returnAmount ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Customer&apos;s New Balance</p>
              {/* Section 7: never clamp a negative balance — a negative
                  number here genuinely means the business now owes the
                  customer money, and that must be visible, not hidden. */}
              <p className={`text-lg font-semibold tabular-nums ${Number(result.sale?.creditAmount ?? 0) < 0 ? "text-amber-600" : ""}`}>
                {formatCurrency(result.sale?.creditAmount ?? 0)}
                {Number(result.sale?.creditAmount ?? 0) < 0 && " (owed to customer)"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setResult(null); setSale(null); setReference(""); }}>
              Process Another Return
            </Button>
          </div>
          {Number(result.sale?.creditAmount ?? 0) < 0 && (
            <p className="text-xs text-muted-foreground">
              This return leaves a balance owed to the customer. Refunding them is done via the Payments API (POST /payments/refund-customer) — there is no dedicated screen for it yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
