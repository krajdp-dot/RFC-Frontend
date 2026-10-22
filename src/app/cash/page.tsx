"use client";

import { NumberInput } from "@/components/ui/number-input";
import Link from "next/link";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Landmark, Smartphone, Plus, Download, RefreshCw, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/fetchApi";
import { PERMISSIONS } from "@/lib/permissions";
import { todayBusinessDate } from "@/lib/businessDate";
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const todayStr = todayBusinessDate();
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

  useEffect(() => {
    if (accounts.length === 0) {
      setTransactions([]);
      setTransactionsLoading(false);
      setTransactionsError("");
      return;
    }

    let cancelled = false;
    async function loadAccountActivity() {
      setTransactionsLoading(true);
      setTransactionsError("");
      const results = await Promise.all(accounts.map(async (account) => {
        try {
          const response = await fetchApi(
            `/accounts/${encodeURIComponent(account.id)}/transactions?page=1&limit=8`
          );
          const items = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.items)
                ? response.items
                : Array.isArray(response?.data?.items)
                  ? response.data.items
                  : [];
          return {
            failed: false,
            items: items.map((entry: any) => ({
              ...entry,
              accountName: account.name,
              accountType: account.type,
            })),
          };
        } catch {
          return { failed: true, items: [] as any[] };
        }
      }));

      if (cancelled) return;
      const successful = results.filter((result) => !result.failed).length;
      const entries = results.flatMap((result) => result.items).sort((a, b) => {
        const aDate = new Date(a.createdAt || a.businessDate || 0).getTime();
        const bDate = new Date(b.createdAt || b.businessDate || 0).getTime();
        if (aDate !== bDate) return bDate - aDate;
        return new Date(b.businessDate || 0).getTime() - new Date(a.businessDate || 0).getTime();
      });
      setTransactions(entries.slice(0, 8));
      setTransactionsError(successful === 0 ? "Account activity could not be loaded." : "");
      setTransactionsLoading(false);
    }

    void loadAccountActivity();
    return () => { cancelled = true; };
  }, [accounts]);

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
      case 'UPI':
      case 'DIGITAL': return <Smartphone className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'CASH': return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600";
      case 'BANK': return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
      case 'UPI':
      case 'DIGITAL': return "bg-purple-100 dark:bg-purple-900/30 text-purple-600";
      default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-600";
    }
  };

  const expectedCash = accounts
    .filter((account) => account.type === "CASH")
    .reduce((sum, account) => sum + Number(account.balance || 0), 0);

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
            <div key={account.id} className="bg-white border border-border rounded-xl p-5 transition-colors hover:border-primary/30 flex flex-col justify-between">
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
        <div className="lg:col-span-2 min-w-0">
          <section className="h-full overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent account activity</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Latest ledger entries across your accounts</p>
              </div>
              <Link href="/money-flow" className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25">
                Money flow <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {transactionsLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading account activity">
                <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
                <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
                <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
              </div>
            ) : transactionsError ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <p className="text-sm font-medium text-foreground">{transactionsError}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setAccounts((current) => [...current])}>
                  Retry activity
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">No account activity yet</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Recorded sales, collections, payments, expenses and transfers will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {transactions.map((entry) => {
                  const debit = Number(entry.debit || 0);
                  const credit = Number(entry.credit || 0);
                  const moneyIn = debit > 0 && credit <= 0;
                  const amount = Math.abs(debit - credit);
                  const dateValue = entry.businessDate || entry.createdAt;
                  const date = dateValue
                    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(dateValue))
                    : "—";
                  const description = entry.description || String(entry.transactionType || "Ledger entry").replaceAll("_", " ").toLowerCase();
                  return (
                    <div key={`${entry.accountId}-${entry.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid-cols-[minmax(0,1fr)_minmax(100px,0.55fr)_auto]">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", moneyIn ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                          {moneyIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-foreground">{description}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:hidden">{entry.accountName} · {date}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{entry.transactionId ? `Ref ${String(entry.transactionId).slice(0, 8)} · ` : ""}{entry.accountName}</span>
                        </span>
                      </div>
                      <span className="hidden truncate text-xs text-muted-foreground sm:block">{date}</span>
                      <span className={cn("whitespace-nowrap text-right text-[13px] font-semibold tabular-nums", moneyIn ? "text-emerald-700" : "text-rose-700")}>
                        {moneyIn ? "+" : "−"}{formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Col - Cash Rec */}
        <div>
          <section className="h-full rounded-xl border border-border bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40">
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="mt-3 text-sm font-semibold tracking-tight text-foreground">Cash reconciliation</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Compare the ledger balance with the cash physically counted in the drawer.</p>
            <div className="mt-5 rounded-lg bg-muted/35 p-3">
              <p className="text-xs text-muted-foreground">Expected cash balance</p>
              <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{formatCurrency(expectedCash)}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Enter the physical count and review any difference in Day Close. The count is saved against the business day.</p>
            <Link href="/day-close" className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25">
              Open Day Close <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
