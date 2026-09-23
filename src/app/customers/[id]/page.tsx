"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"
import { Can } from "@/components/auth/Can"
import { PERMISSIONS } from "@/lib/permissions"
import { WhatsAppPanel } from "@/components/whatsapp/WhatsAppPanel"
import { WhatsAppHistory } from "@/components/whatsapp/WhatsAppHistory"

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerError, setLedgerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomer() {
    try {
      setLoading(true);
      const [customerRes, ledgerRes] = await Promise.all([
        fetchApi(`/customers/${id}`),
        fetchApi(`/customers/${id}/ledger?limit=10`).catch((err) => {
          setLedgerError(err.message || "Failed to load transaction history");
          return null;
        }),
      ]);
      setCustomer(customerRes);
      if (ledgerRes) {
        setLedger(Array.isArray(ledgerRes) ? ledgerRes : ledgerRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading customer details...</div>;
  if (error || !customer) return <div className="p-8 text-center text-destructive">{error || "Customer not found"}</div>;

  // Real figure from CustomersService.getCustomerSummary — Section 3:
  // "Do not calculate customer outstanding independently in the frontend
  // if backend already provides authoritative values."
  const outstanding = Number(customer.summary?.outstanding || 0);
  const creditLimit = customer.creditLimit || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card border rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{customer.name}</h1>
          {customer.businessName && <p className="text-muted-foreground mb-4">{customer.businessName}</p>}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Outstanding:</span>
            <StatusBadge label={formatCurrency(outstanding)} variant={outstanding > 0 ? "error" : "success"} />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => router.push(`/sales/new?customerId=${id}`)}>New Sale</Button>
          <Button onClick={() => router.push(`/receivables/receive-payment?customerId=${id}`)}>Receive Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Credit Limit</p>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(creditLimit)}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Credit Terms</p>
              <p className="text-xl font-semibold tabular-nums">{customer.creditTermsDays || 0} days</p>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Transactions</h2>
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
                <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
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
                          variant={entry.type === "SALE" ? "warning" : "success"}
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
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact Information</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{customer.phone || "No phone provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="leading-tight">{customer.address || "No address provided"}</p>
              </div>
            </div>
          </div>

          <Can permission={PERMISSIONS.WHATSAPP_VIEW}>
            <WhatsAppPanel
              customerId={id}
              customerName={customer.name}
              hasPhone={Boolean(customer.whatsappNumber || customer.phone)}
              optedIn={Boolean(customer.whatsappOptIn)}
              onOptInChanged={loadCustomer}
            />
          </Can>
        </div>
      </div>

      <Can permission={PERMISSIONS.WHATSAPP_VIEW}>
        <WhatsAppHistory customerId={id} />
      </Can>
    </div>
  )
}
