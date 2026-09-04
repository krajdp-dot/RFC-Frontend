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

export default function ReceivePaymentPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditSales, setCreditSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    saleId: "",
    amount: "",
    method: "CASH",
    accountId: "",
    businessDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [custData, accData] = await Promise.all([
          fetchApi("/customers"),
          fetchApi("/accounts"),
        ]);
        setCustomers(
          Array.isArray(custData) ? custData : custData.data || []
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

  // When customer changes, load their credit sales
  useEffect(() => {
    if (!form.customerId) {
      setCreditSales([]);
      return;
    }
    async function loadSales() {
      try {
        const data = await fetchApi(
          `/sales?search=&limit=100&customerId=${form.customerId}`
        );
        const sales = Array.isArray(data) ? data : data.data || [];
        setCreditSales(
          sales.filter((s: any) => Number(s.creditAmount) > 0)
        );
      } catch {
        setCreditSales([]);
      }
    }
    loadSales();
  }, [form.customerId]);

  // When sale is selected, pre-fill amount
  useEffect(() => {
    if (form.saleId) {
      const sale = creditSales.find((s) => s.id === form.saleId);
      if (sale) {
        setForm((f) => ({ ...f, amount: Number(sale.creditAmount).toString() }));
      }
    }
  }, [form.saleId, creditSales]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.accountId) {
      setError("Customer, amount, and account are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await fetchApi("/payments/received", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          amount: form.amount,
          method: form.method,
          accountId: form.accountId,
          businessDate: form.businessDate,
          saleId: form.saleId || undefined,
          notes: form.notes || undefined,
        }),
      });
      setSuccess("Payment recorded successfully!");
      setTimeout(() => router.push("/receivables"), 1500);
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
        title="Receive Payment"
        subtitle="Record a payment received from a customer."
        secondaryActions={[
          { label: "Back to Receivables", icon: ArrowLeft, onClick: () => router.push("/receivables") },
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

      <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 flex flex-col gap-5">
        {/* Customer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Customer *</label>
          <select
            value={form.customerId}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerId: e.target.value, saleId: "" }))
            }
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select customer...</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.businessName ? `(${c.businessName})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Sale (optional) */}
        {creditSales.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Against Sale (optional)
            </label>
            <select
              value={form.saleId}
              onChange={(e) => setForm((f) => ({ ...f, saleId: e.target.value }))}
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">General payment (no specific sale)</option>
              {creditSales.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.saleReference} — Outstanding: {formatCurrency(s.creditAmount)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount + Method row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Method *</label>
            <select
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
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
            <label className="text-sm font-medium text-muted-foreground">Deposit Account *</label>
            <select
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
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
            <label className="text-sm font-medium text-muted-foreground">Business Date *</label>
            <input
              type="date"
              value={form.businessDate}
              onChange={(e) => setForm((f) => ({ ...f, businessDate: e.target.value }))}
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Notes</label>
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
          <Link href="/receivables">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            {submitting ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
