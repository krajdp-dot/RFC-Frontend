"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
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

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

export default function MakePaymentPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditPurchases, setCreditPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    supplierId: "",
    purchaseId: "",
    amount: "",
    method: "CASH",
    accountId: "",
    businessDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [suppData, accData] = await Promise.all([
          fetchApi("/suppliers"),
          fetchApi("/accounts"),
        ]);
        setSuppliers(
          Array.isArray(suppData) ? suppData : suppData.data || []
        );
        setAccounts(
          Array.isArray(accData) ? accData : accData.data || []
        );
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When supplier changes, load their credit purchases
  useEffect(() => {
    if (!form.supplierId) {
      setCreditPurchases([]);
      return;
    }
    async function loadPurchases() {
      try {
        const data = await fetchApi(
          `/purchases?search=&limit=100&supplierId=${form.supplierId}`
        );
        const purchases = Array.isArray(data) ? data : data.data || [];
        setCreditPurchases(
          purchases.filter((p: any) => Number(p.creditAmount) > 0)
        );
      } catch {
        setCreditPurchases([]);
      }
    }
    loadPurchases();
  }, [form.supplierId]);

  // When purchase is selected, pre-fill amount
  useEffect(() => {
    if (form.purchaseId) {
      const purchase = creditPurchases.find((p) => p.id === form.purchaseId);
      if (purchase) {
        setForm((f) => ({
          ...f,
          amount: Number(purchase.creditAmount).toString(),
        }));
      }
    }
  }, [form.purchaseId, creditPurchases]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.supplierId || !form.amount || !form.accountId) {
      setError("Supplier, amount, and account are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await fetchApi("/payments/paid", {
        method: "POST",
        body: JSON.stringify({
          supplierId: form.supplierId,
          amount: form.amount,
          method: form.method,
          accountId: form.accountId,
          businessDate: form.businessDate,
          purchaseId: form.purchaseId || undefined,
          notes: form.notes || undefined,
        }),
      });
      setSuccess("Payment recorded successfully!");
      setTimeout(() => router.push("/payables"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
        <div className="p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <PageHeader
        title="Make Payment"
        subtitle="Record a payment made to a supplier."
        secondaryActions={[
          {
            label: "Back to Payables",
            icon: ArrowLeft,
            onClick: () => router.push("/payables"),
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
        {/* Supplier */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Supplier *
          </label>
          <select
            value={form.supplierId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                supplierId: e.target.value,
                purchaseId: "",
              }))
            }
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select supplier...</option>
            {suppliers.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.businessName ? `(${s.businessName})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase (optional) */}
        {creditPurchases.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Against Purchase (optional)
            </label>
            <select
              value={form.purchaseId}
              onChange={(e) =>
                setForm((f) => ({ ...f, purchaseId: e.target.value }))
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">General payment (no specific purchase)</option>
              {creditPurchases.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.purchaseReference} — Outstanding:{" "}
                  {formatCurrency(p.creditAmount)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount + Method row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              placeholder="0.00"
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Method *
            </label>
            <select
              value={form.method}
              onChange={(e) =>
                setForm((f) => ({ ...f, method: e.target.value }))
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Source Account *
            </label>
            <select
              value={form.accountId}
              onChange={(e) =>
                setForm((f) => ({ ...f, accountId: e.target.value }))
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select account...</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Business Date *
            </label>
            <input
              type="date"
              value={form.businessDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, businessDate: e.target.value }))
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes..."
            rows={2}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/payables">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className="gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {submitting ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
