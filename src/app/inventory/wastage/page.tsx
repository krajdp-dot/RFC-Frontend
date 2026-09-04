"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function WastagePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    productId: "",
    lotId: "",
    quantityBoxes: "",
    weightKg: "",
    reason: "",
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchApi("/inventory");
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // When product changes, load its lots
  useEffect(() => {
    if (!form.productId) {
      setLots([]);
      return;
    }
    async function loadLots() {
      try {
        const data = await fetchApi(`/inventory/products/${form.productId}`);
        setLots(data?.lots || []);
      } catch {
        setLots([]);
      }
    }
    loadLots();
  }, [form.productId]);

  const selectedLot = lots.find((l: any) => l.id === form.lotId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lotId || !form.reason) {
      setError("Lot and reason are required");
      return;
    }
    if (!form.quantityBoxes && !form.weightKg) {
      setError("Specify at least boxes or weight");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await fetchApi("/inventory/wastage", {
        method: "POST",
        body: JSON.stringify({
          lotId: form.lotId,
          quantityBoxes: form.quantityBoxes
            ? parseInt(form.quantityBoxes, 10)
            : undefined,
          weightKg: form.weightKg || undefined,
          reason: form.reason,
        }),
      });
      setSuccess("Wastage recorded successfully!");
      setTimeout(() => router.push("/inventory"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to record wastage");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <PageHeader
        title="Record Wastage"
        subtitle="Record spoiled, damaged, or expired stock."
        secondaryActions={[
          {
            label: "Back to Inventory",
            icon: ArrowLeft,
            onClick: () => router.push("/inventory"),
          },
        ]}
      />

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border rounded-xl p-6 flex flex-col gap-5"
      >
        {/* Product */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Product *
          </label>
          <select
            value={form.productId}
            onChange={(e) =>
              setForm((f) => ({ ...f, productId: e.target.value, lotId: "" }))
            }
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select product...</option>
            {products
              .filter((p: any) => p.remainingBoxes > 0)
              .map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.remainingBoxes} boxes in stock
                </option>
              ))}
          </select>
        </div>

        {/* Lot */}
        {lots.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Lot *
            </label>
            <select
              value={form.lotId}
              onChange={(e) =>
                setForm((f) => ({ ...f, lotId: e.target.value }))
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select lot...</option>
              {lots.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.lotReference} — {l.remainingBoxes} boxes,{" "}
                  {formatCurrency(l.costPerBox)}/box
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Lot info card */}
        {selectedLot && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                Lot: {selectedLot.lotReference}
              </p>
              <p className="text-amber-700 mt-1">
                Available: <strong>{selectedLot.remainingBoxes} boxes</strong> •
                Cost/box: {formatCurrency(selectedLot.costPerBox)} • Quality:{" "}
                {selectedLot.quality} • Freshness: {selectedLot.freshnessStatus}
              </p>
            </div>
          </div>
        )}

        {/* Quantity row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Boxes to Waste
            </label>
            <input
              type="number"
              min="1"
              max={selectedLot?.remainingBoxes || 9999}
              value={form.quantityBoxes}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantityBoxes: e.target.value }))
              }
              placeholder="e.g. 2"
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Weight (kg) — optional
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.weightKg}
              onChange={(e) =>
                setForm((f) => ({ ...f, weightKg: e.target.value }))
              }
              placeholder="e.g. 5.5"
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
            />
          </div>
        </div>

        {/* Estimated loss */}
        {form.quantityBoxes && selectedLot && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            Estimated loss:{" "}
            <strong>
              {formatCurrency(
                Number(form.quantityBoxes) * Number(selectedLot.costPerBox)
              )}
            </strong>{" "}
            ({form.quantityBoxes} boxes × {formatCurrency(selectedLot.costPerBox)}
            /box)
          </div>
        )}

        {/* Reason */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Reason *
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="e.g. Rotten due to humidity, Damaged boxes, Pest infestation..."
            rows={2}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/inventory">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className="gap-1.5 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {submitting ? "Recording..." : "Record Wastage"}
          </Button>
        </div>
      </form>
    </div>
  );
}
