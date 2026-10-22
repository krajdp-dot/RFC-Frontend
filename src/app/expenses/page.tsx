"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pagination, PaginationMeta } from "@/components/shared/Pagination";
import { PERMISSIONS } from "@/lib/permissions";
import { QuickPick } from "@/components/shared/QuickPick";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

// Same reasoning as the sales/purchases forms: the account chosen already
// tells us the real payment method, so there's one fewer thing to pick (and
// one fewer way for the two to disagree).
function methodForAccountType(type: string | undefined): string {
  if (type === "BANK") return "BANK_TRANSFER";
  if (type === "DIGITAL") return "UPI";
  return "CASH";
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    categoryId: "",
    description: "",
    amount: "",
    accountId: "",
    businessDate: todayStr,
    payee: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const [expensesResponse, summaryResponse] = await Promise.all([
        fetchApi(`/expenses?${params.toString()}`),
        fetchApi(`/expenses/summary`),
      ]);

      if (expensesResponse && expensesResponse.data) {
        setExpenses(expensesResponse.data);
        setMeta(expensesResponse.meta || null);
      } else if (Array.isArray(expensesResponse)) {
        setExpenses(expensesResponse);
        setMeta(null);
      } else {
        setExpenses([]);
        setMeta(null);
      }

      setSummary(summaryResponse);
    } catch (err: any) {
      console.error("Failed to load expenses:", err);
      setError(err.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (!dialogOpen) return;
    fetchApi("/expenses/categories")
      .then((res) => setCategories(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setCategories([]));
    fetchApi("/accounts?limit=100")
      .then((res) => setAccounts(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setAccounts([]));
  }, [dialogOpen]);

  function openDialog() {
    setForm({
      categoryId: "",
      description: "",
      amount: "",
      accountId: "",
      businessDate: todayStr,
      payee: "",
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.categoryId || !form.description || !form.amount || !form.accountId) {
      setFormError("Please fill in category, description, amount, and account.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const account = accounts.find((a) => a.id === form.accountId);
      await fetchApi("/expenses", {
        method: "POST",
        body: JSON.stringify({
          categoryId: form.categoryId,
          description: form.description,
          amount: form.amount,
          accountId: form.accountId,
          paymentMethod: methodForAccountType(account?.type),
          businessDate: form.businessDate,
          payee: form.payee || undefined,
        }),
      });
      setDialogOpen(false);
      // Section 25: an expense affects the expense list itself, cash/bank
      // balance, and (elsewhere) the dashboard — this reloads the two
      // pieces this page owns; the dashboard picks up the new figure next
      // time it's loaded, same as every other mutation in this app.
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  }

  const metrics = [
    { label: "Today", value: formatCurrency(summary?.todayTotal || 0) },
    { label: "This Month", value: formatCurrency(summary?.monthTotal || 0) },
    { label: "Largest Category", value: summary?.largestCategory?.name || "None", subtext: formatCurrency(summary?.largestCategory?.amount || 0) },
    { label: "Cash Expenses", value: formatCurrency(summary?.cashExpenses || 0) },
  ];

  const breakdown = summary?.breakdown || [];
  const colors = ["bg-blue-500", "bg-amber-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-slate-500"];

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-1 pb-8">
      <PageHeader 
        title="Expenses" 
        subtitle="Understand where business money is going." 
        primaryAction={{ label: "Record Expense", icon: Plus, onClick: openDialog, permission: PERMISSIONS.EXPENSES_CREATE }} 
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <QuickPick
                value={form.categoryId}
                onChange={(categoryId) => setForm({ ...form, categoryId })}
                options={categories.map((category: any) => ({
                  value: category.id,
                  label: category.name,
                }))}
                mode="grid"
                columns={2}
                maxVisible={6}
                searchable={categories.length > 4}
                emptyText="No expense categories found."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Truck hire to Nashik mandi"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <Input
                  type="number"
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
              <label className="text-sm font-medium mb-1 block">Paid From</label>
              <QuickPick
                value={form.accountId}
                onChange={(accountId) => setForm({ ...form, accountId })}
                options={accounts.map((account: any) => ({
                  value: account.id,
                  label: account.name,
                  detail: account.type,
                }))}
                mode="grid"
                columns={2}
                maxVisible={4}
                placeholder="Search payment accounts…"
                emptyText="No accounts found."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Payee (optional)</label>
              <Input
                value={form.payee}
                onChange={(e) => setForm({ ...form, payee: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <MetricStrip metrics={metrics} />
      
      {breakdown.length > 0 && (
        <div className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-6">Where did money go? (This Month)</h2>
          
          <div className="space-y-5">
            <div className="h-6 w-full rounded-full overflow-hidden flex bg-muted">
              {breakdown.map((item: any, i: number) => {
                const pct = (Number(item.amount) / Number(summary.monthTotal)) * 100;
                return (
                  <div 
                    key={item.category} 
                    className={`h-full ${colors[i % colors.length]} border-r border-background/20 last:border-0 hover:opacity-90 transition-opacity cursor-pointer`} 
                    style={{ width: `${pct}%` }}
                    title={`${item.category}: ${formatCurrency(item.amount)}`}
                  />
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {breakdown.map((item: any, i: number) => (
                <div key={item.category} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums ml-5">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Expenses</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search expenses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground" onClick={loadData}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadData} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && expenses.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No expenses found.
          </div>
        )}

        {!loading && !error && expenses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Method</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(expense.businessDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className="px-2 py-1 rounded-md bg-muted text-xs">{expense.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{expense.description}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-right">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{expense.paymentMethod}</td>
                    <td className="px-4 py-3 text-muted-foreground">{expense.account?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && expenses.length > 0 && !loading && !error && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
