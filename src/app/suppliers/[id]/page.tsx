"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function SupplierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [supplier, setSupplier] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerError, setLedgerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSupplier() {
      try {
        setLoading(true);
        const [supplierRes, ledgerRes] = await Promise.all([
          fetchApi(`/suppliers/${id}`),
          fetchApi(`/suppliers/${id}/ledger?limit=10`).catch((err) => {
            setLedgerError(err.message || "Failed to load transaction history");
            return null;
          }),
        ]);
        setSupplier(supplierRes);
        if (ledgerRes) {
          setLedger(Array.isArray(ledgerRes) ? ledgerRes : ledgerRes.data || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load supplier");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadSupplier();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading supplier details...</div>;
  if (error || !supplier) return <div className="p-8 text-center text-destructive">{error || "Supplier not found"}</div>;

  const outstanding = Number(supplier.summary?.outstanding || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border/80 bg-card shadow-sm p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{supplier.name}</h1>
          {supplier.businessName && <p className="text-muted-foreground mb-4">{supplier.businessName}</p>}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Payable:</span>
            <StatusBadge label={formatCurrency(outstanding)} variant={outstanding > 0 ? "error" : "success"} />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => router.push(`/purchases/new?supplierId=${id}`)}>New Purchase</Button>
          <Button onClick={() => router.push(`/payables/make-payment?supplierId=${id}`)}>Make Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(supplier.summary?.totalPurchases || 0)}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Payment Terms</p>
              <p className="text-xl font-semibold tabular-nums">{supplier.paymentTermsDays || 0} days</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Transactions</h2>
            </div>
            {ledgerError && (
              <div className="p-8 text-center text-destructive text-sm">{ledgerError}</div>
            )}
            {!ledgerError && ledger.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No transactions yet.
              </div>
            )}
            {!ledgerError && ledger.length > 0 && (
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">Date</th>
                    <th className="px-6 py-2.5 font-medium">Type</th>
                    <th className="px-6 py-2.5 font-medium">Reference</th>
                    <th className="px-6 py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ledger.map((entry: any) => (
                    <tr key={`${entry.type}-${entry.id}`}>
                      <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge
                          label={entry.type}
                          variant={entry.type === "PURCHASE" ? "warning" : "success"}
                        />
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{entry.reference || "—"}</td>
                      <td className="px-6 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-6">
            <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Contact Information</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{supplier.phone || "No phone provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="leading-tight">{supplier.address || "No address provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
