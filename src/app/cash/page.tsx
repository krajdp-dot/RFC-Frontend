"use client";

import { NumberInput } from "@/components/ui/number-input";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Landmark, Smartphone, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/fetchApi";
import { PERMISSIONS } from "@/lib/permissions";
import { QuickPick } from "@/components/shared/QuickPick";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function CashBanksPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    businessDate: todayStr,
    notes: "",
  });

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetchApi('/accounts');
      if (Array.isArray(response)) {
        setAccounts(response);
      } else if (response && Array.isArray(response.data)) {
        setAccounts(response.data);
      } else {
        setAccounts([]);
      }
    } catch (err: any) {
      console.error("Failed to load accounts:", err);
      setError(err.message || "Failed to load accounts");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function openDialog() {
    setForm({ fromAccountId: "", toAccountId: "", amount: "", businessDate: todayStr, notes: "" });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.fromAccountId || !form.toAccountId || !form.amount) {
      setFormError("Please select both accounts and an amount.");
      return;
    }
    if (form.fromAccountId === form.toAccountId) {
      setFormError("Choose two different accounts.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      await fetchApi("/accounts/transfers", {
        method: "POST",
        body: JSON.stringify({
          fromAccountId: form.fromAccountId,
          toAccountId: form.toAccountId,
          amount: form.amount,
          businessDate: form.businessDate,
          notes: form.notes || undefined,
        }),
      });
      setDialogOpen(false);
      // A transfer changes both accounts' balances — reload the list so
      // the cards reflect it immediately rather than requiring a manual page reload.
      await loadAccounts();
    } catch (err: any) {
      setFormError(err.message || "Failed to record transfer");
    } finally {
      setSubmitting(false);
    }
  }

  const getIconForType = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'CASH': return <Wallet className="w-5 h-5" />;
      case 'BANK': return <Landmark className="w-5 h-5" />;
      case 'UPI': return <Smartphone className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'CASH': return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600";
      case 'BANK': return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
      case 'UPI': return "bg-purple-100 dark:bg-purple-900/30 text-purple-600";
      default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-600";
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const expectedCash = accounts.find(a => a.type === 'CASH')?.balance || 0;

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Cash & Banks"
        subtitle="Track all money across accounts."
        primaryAction={{ label: "Transfer Money", icon: Plus, onClick: openDialog, permission: PERMISSIONS.ACCOUNTS_TRANSFER }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer Money</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium mb-1 block">From Account</label>
              <QuickPick
                value={form.fromAccountId}
                onChange={(fromAccountId) => setForm({ ...form, fromAccountId })}
                options={accounts.map((account: any) => ({
                  value: account.id,
                  label: account.name,
                  detail: account.type,
                  meta: formatCurrency(account.balance),
                  disabled: account.id === form.toAccountId,
                  icon: account.type === "BANK" ? Landmark : account.type === "UPI" || account.type === "DIGITAL" ? Smartphone : Wallet,
                }))}
                mode="list"
                maxVisible={5}
                placeholder="Find source account…"
                emptyText="No source accounts found."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To Account</label>
              <QuickPick
                value={form.toAccountId}
                onChange={(toAccountId) => setForm({ ...form, toAccountId })}
                options={accounts.map((account: any) => ({
                  value: account.id,
                  label: account.name,
                  detail: account.type,
                  meta: formatCurrency(account.balance),
                  disabled: account.id === form.fromAccountId,
                  icon: account.type === "BANK" ? Landmark : account.type === "UPI" || account.type === "DIGITAL" ? Smartphone : Wallet,
                }))}
                mode="list"
                maxVisible={5}
                placeholder="Find destination account…"
                emptyText="No destination accounts found."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <NumberInput
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={form.businessDate}
                  onChange={(e) => setForm({ ...form, businessDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Transferring..." : "Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>
      )}

      {!loading && error && (
        <div className="p-8 text-center text-destructive">
          <p>{error}</p>
          <button type="button" onClick={loadAccounts} className="mt-3 underline">Try again</button>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No accounts found. Create one in Settings.
        </div>
      )}

      {/* Account Cards */}
      {!loading && !error && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map(account => (
            <div key={account.id} className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${getColorForType(account.type)}`}>
                    {getIconForType(account.type)}
                  </div>
                  <span className="text-sm font-medium">{account.name}</span>
                </div>
                <h3 className="text-2xl font-bold tabular-nums mb-4">{formatCurrency(account.balance)}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Transactions</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="p-8 flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <p>Transaction history integration pending</p>
            </div>
          </div>
        </div>

        {/* Right Col - Cash Rec */}
        <div>
          <div className="bg-card border rounded-xl p-6 h-full">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Cash Reconciliation</h2>
            <p className="text-sm text-muted-foreground mb-6">Verify physical cash in drawer at end of day.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Expected Cash</span>
                <span className="font-semibold tabular-nums">{formatCurrency(expectedCash)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Physical Cash</span>
                <span className="font-semibold tabular-nums text-muted-foreground">—</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Difference</span>
                <span className="font-semibold tabular-nums text-muted-foreground">—</span>
              </div>
              
              <Button className="w-full mt-4" variant="outline" disabled>Log Discrepancy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
