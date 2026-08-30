"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/fetchApi";
import { 
  Building2, 
  Tag, 
  Timer, 
  WalletCards, 
  Receipt, 
  Palette, 
  Database,
  ChevronRight,
  Plus
} from "lucide-react";

export default function SettingsPage() {
  const [business, setBusiness] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bizRes, accRes] = await Promise.allSettled([
          fetchApi('/businesses/current'),
          fetchApi('/accounts')
        ]);
        
        if (bizRes.status === 'fulfilled') {
          setBusiness(bizRes.value);
        }
        
        if (accRes.status === 'fulfilled') {
          const accs = Array.isArray(accRes.value) ? accRes.value : (accRes.value?.data || []);
          setAccounts(accs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Settings"
        description="Configure your business and application."
      />

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading settings...</div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* BUSINESS PROFILE */}
          <section className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Business Profile</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manage your company information</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-[150px_1fr] items-center py-2">
                <span className="text-sm text-muted-foreground">Business Name</span>
                <span className="text-sm font-medium">{business?.legalName || business?.name || "Not available"}</span>
              </div>
              <div className="border-t border-dashed"></div>
              <div className="grid grid-cols-[150px_1fr] items-center py-2">
                <span className="text-sm text-muted-foreground">Owner</span>
                <span className="text-sm font-medium">{business?.ownerName || "Not available"}</span>
              </div>
              <div className="border-t border-dashed"></div>
              <div className="grid grid-cols-[150px_1fr] items-center py-2">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">{business?.phone || "Not available"}</span>
              </div>
              <div className="border-t border-dashed"></div>
              <div className="grid grid-cols-[150px_1fr] items-center py-2">
                <span className="text-sm text-muted-foreground">Address</span>
                <span className="text-sm font-medium">{business?.address || "Not available"}</span>
              </div>
              <div className="border-t border-dashed"></div>
              <div className="grid grid-cols-[150px_1fr] items-center py-2">
                <span className="text-sm text-muted-foreground">GST</span>
                <span className="text-sm font-medium italic">{business?.gstNumber || "Not registered"}</span>
              </div>
            </div>
          </section>

          {/* PRODUCTS & PRICING */}
          <section className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Products & Pricing</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Configure markup and pricing rules</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Pricing Configuration</span>
                <span className="text-sm font-medium text-muted-foreground">Integration pending</span>
              </div>
            </div>
          </section>

          {/* ACCOUNTS */}
          <section className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
              <div>
                <div className="flex items-center space-x-2">
                  <WalletCards className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Accounts</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Manage bank accounts and wallets</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1" disabled><Plus className="h-3.5 w-3.5" /> Add Account</Button>
            </div>
            <div className="p-0">
              {accounts.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">No accounts found.</div>
              ) : (
                accounts.map((acc, index) => (
                  <div key={acc.id || index}>
                    {index > 0 && <div className="border-t"></div>}
                    <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
                      <span className="text-sm font-medium">{acc.name} ({acc.type})</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {acc.status || "Active"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
