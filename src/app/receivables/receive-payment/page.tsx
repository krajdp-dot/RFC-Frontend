"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useOffline } from "@/contexts/OfflineContext";
import { submitWithOfflineFallback } from "@/lib/offline/offlineMutate";
import { setCache, getCache, CACHE_KEYS, formatAge } from "@/lib/offline/cacheStore";
import { PostSaleWhatsAppOffer } from "@/components/whatsapp/PostSaleWhatsAppOffer";
import { QuickPick } from "@/components/shared/QuickPick";

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
  const searchParams = useSearchParams();
  const prefillCustomerId = searchParams.get("customerId") || "";
  const { user, business } = useAuth();
  const { refresh: refreshOffline } = useOffline();
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditSales, setCreditSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usingCachedOptions, setUsingCachedOptions] = useState(false);
  const [cacheAge, setCacheAge] = useState("");
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  // Phase 11: stable across retries — same reasoning as sales/new (section 8).
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [form, setForm] = useState({
    customerId: prefillCustomerId,
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
        const custArr = Array.isArray(custData) ? custData : custData.data || [];
        const accArr = Array.isArray(accData) ? accData : accData.data || [];
        setCustomers(custArr);
        setAccounts(accArr);
        void setCache(CACHE_KEYS.customers, custArr);
        void setCache(CACHE_KEYS.accounts, accArr);
      } catch (err: any) {
        // Phase 11: same fallback as sales/new — cached master data keeps
        // this page usable offline instead of a dead end.
        const [cachedCustomers, cachedAccounts] = await Promise.all([
          getCache<any[]>(CACHE_KEYS.customers),
          getCache<any[]>(CACHE_KEYS.accounts),
        ]);
        if (cachedCustomers && cachedAccounts) {
          setCustomers(cachedCustomers.value);
          setAccounts(cachedAccounts.value);
          setUsingCachedOptions(true);
          setCacheAge(formatAge(cachedCustomers));
        } else {
          setError(err.message || "Failed to load data");
        }
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
          `/sales?customerId=${form.customerId}&limit=100`
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
    if (submitting) return;
    if (!form.customerId || !form.amount || !form.accountId) {
      setError("Customer, amount, and account are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        customerId: form.customerId,
        amount: form.amount,
        method: form.method,
        accountId: form.accountId,
        businessDate: form.businessDate,
        saleId: form.saleId || undefined,
        notes: form.notes || undefined,
        idempotencyKey,
      };
      const customerName = customers.find((c: any) => c.id === form.customerId)?.name || "Customer";

      // Phase 11: same pattern as sales/new — only a network failure on
      // this specific operation falls back to the queue; anything else
      // (validation, an already-settled sale) throws through unchanged.
      const result = await submitWithOfflineFallback({
        operation: "payment.receive",
        endpoint: "/payments/received",
        payload,
        mutationId: idempotencyKey,
        businessId: business?.id || "",
        userId: user?.id || "",
        entityLabel: "Payment",
        summary: `${customerName} · \u20b9${Number(form.amount).toLocaleString("en-IN")}`,
      });

      if (result.mode === "queued") {
        setQueuedOffline(true);
        void refreshOffline();
        setTimeout(() => router.push("/receivables"), 1800);
      } else {
        setCreatedPaymentId(result.data.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-1 pb-8">
        <div className="p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (createdPaymentId) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-md mx-auto">
        <PostSaleWhatsAppOffer
          kind="payment"
          entityId={createdPaymentId}
          onDone={() => router.push("/receivables")}
        />
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

      {queuedOffline && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-lg p-4 text-sm font-medium flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0" />
          Couldn&apos;t reach RFC — this payment is safely saved on this device and will sync automatically.
        </div>
      )}

      {usingCachedOptions && !queuedOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs flex items-center gap-2">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          Showing customers and accounts from {cacheAge} — couldn&apos;t refresh just now.
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-7 flex flex-col gap-6">
        {/* Customer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Customer *</label>
          <QuickPick
            value={form.customerId}
            onChange={(customerId) => setForm((f) => ({ ...f, customerId, saleId: "" }))}
            options={customers.map((customer: any) => ({
              value: customer.id,
              label: customer.name,
              detail: customer.businessName || customer.phone || undefined,
            }))}
            mode="list"
            maxVisible={4}
            placeholder="Search customer…"
            searchPlaceholder="Find customer by name…"
            emptyText="No customer matches that search."
          />
        </div>

        {/* Sale (optional) */}
        {creditSales.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Against Sale (optional)
            </label>
            <QuickPick
              value={form.saleId}
              onChange={(saleId) => setForm((f) => ({ ...f, saleId }))}
              options={[
                { value: "", label: "General account payment", detail: "No specific sale selected" },
                ...creditSales.map((sale: any) => ({
                  value: sale.id,
                  label: sale.saleReference,
                  detail: `Outstanding ${formatCurrency(sale.creditAmount)}`,
                  meta: formatCurrency(sale.creditAmount),
                })),
              ]}
              mode="list"
              maxVisible={4}
              placeholder="Search open sales…"
              searchPlaceholder="Find sale reference…"
              emptyText="No open credit sales found."
            />
          </div>
        )}

        {/* Amount + Method row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <QuickPick
              value={form.method}
              onChange={(method) => setForm((f) => ({ ...f, method }))}
              options={PAYMENT_METHODS.map((method) => ({ value: method.value, label: method.label }))}
              mode="segments"
              searchable={false}
              maxVisible={4}
            />
          </div>
        </div>

        {/* Account + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Deposit Account *</label>
            <QuickPick
              value={form.accountId}
              onChange={(accountId) => setForm((f) => ({ ...f, accountId }))}
              options={accounts.map((account: any) => ({
                value: account.id,
                label: account.name,
                detail: account.type,
              }))}
              mode="grid"
              columns={2}
              maxVisible={4}
              placeholder="Search deposit accounts…"
              emptyText="No deposit accounts found."
            />
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
            {queuedOffline ? "Saved offline ✓" : submitting ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
