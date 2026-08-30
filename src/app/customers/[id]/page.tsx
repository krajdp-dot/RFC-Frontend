"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Clock, CreditCard } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const res = await fetchApi(`/customers/${id}`);
        setCustomer(res);
      } catch (err: any) {
        setError(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCustomer();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading customer details...</div>;
  if (error || !customer) return <div className="p-8 text-center text-destructive">{error || "Customer not found"}</div>;

  const outstanding = 0; // Backend does not seem to provide outstanding yet, default to 0
  const creditLimit = customer.creditLimit || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card border rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{customer.name}</h1>
          {customer.businessName && <p className="text-muted-foreground mb-4">{customer.businessName}</p>}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Outstanding:</span>
            <StatusBadge label={"₹" + outstanding} variant={outstanding > 0 ? "error" : "success"} />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline">Statement</Button>
          <Button variant="outline">New Sale</Button>
          <Button>Receive Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Credit Limit</p>
              <p className="text-xl font-semibold tabular-nums">₹{creditLimit}</p>
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
            <div className="p-8 text-center text-muted-foreground text-sm">
              Transaction history integration pending
            </div>
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
        </div>
      </div>
    </div>
  )
}
