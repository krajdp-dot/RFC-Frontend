"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { OfflineQueueNotice } from "@/components/offline/OfflineQueueNotice"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { fetchApi } from "@/lib/fetchApi";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/lib/permissions";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function ReceivablesPage() {
  const [summary, setSummary] = useState<any>(null);
  const [aging, setAging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { can } = useAuth();
  const [remindingCustomerId, setRemindingCustomerId] = useState<string | null>(null);
  const [reminderFeedback, setReminderFeedback] = useState<{ customerId: string; kind: "success" | "error"; message: string } | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      
      const [summaryData, agingData] = await Promise.all([
        fetchApi('/receivables'),
        fetchApi('/receivables/aging')
      ]);
      
      setSummary(summaryData);
      setAging(Array.isArray(agingData) ? agingData : (agingData.data || []));
    } catch (err: any) {
      console.error("Failed to load receivables:", err);
      setError(err.message || "Failed to load receivables");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function sendOutstandingReminder(customerId: string) {
    if (!can(PERMISSIONS.WHATSAPP_SEND) || remindingCustomerId) return;
    setRemindingCustomerId(customerId);
    setReminderFeedback(null);
    try {
      await fetchApi(`/whatsapp/customers/${encodeURIComponent(customerId)}/outstanding-reminder`, {
        method: "POST",
      });
      setReminderFeedback({
        customerId,
        kind: "success",
        message: "Reminder request accepted by WhatsApp.",
      });
    } catch (err) {
      setReminderFeedback({
        customerId,
        kind: "error",
        message: err instanceof Error ? err.message : "Could not send the reminder.",
      });
    } finally {
      setRemindingCustomerId(null);
    }
  }

  const metrics = [
    { label: "Total Receivables", value: formatCurrency(summary?.totalReceivables || 0) },
    { label: "Overdue", value: formatCurrency(summary?.totalOverdue || 0) },
    { label: "Due Soon (0-15d)", value: formatCurrency(summary?.due0To15 || 0) },
    { label: "Current", value: formatCurrency(summary?.current || 0) },
    { label: "Collected This Month", value: formatCurrency(summary?.collectedThisMonth || 0) },
  ];

  const total = Number(summary?.totalReceivables) || 1;
  const bucket0to15Pct = ((Number(summary?.due0To15) || 0) / total) * 100;
  const bucket16to30Pct = ((Number(summary?.due16To30) || 0) / total) * 100;
  const bucket31to45Pct = ((Number(summary?.due31To45) || 0) / total) * 100;
  const bucketOver45Pct = ((Number(summary?.dueOver45) || 0) / total) * 100;

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Receivables"
        subtitle="Review customer dues, record collections and send individual WhatsApp reminders where enabled."
      />

      <MetricStrip metrics={metrics} />

      <OfflineQueueNotice operation="payment.receive" label="payment" />

      {/* Ageing Breakdown */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Ageing Breakdown</h2>
        <div className="flex h-8 rounded-md overflow-hidden mb-4 bg-muted">
          <div className="bg-emerald-500" style={{ width: `${bucket0to15Pct}%` }} title={`0-15 days: ${formatCurrency(summary?.due0To15)}`}></div>
          <div className="bg-amber-500" style={{ width: `${bucket16to30Pct}%` }} title={`16-30 days: ${formatCurrency(summary?.due16To30)}`}></div>
          <div className="bg-orange-500" style={{ width: `${bucket31to45Pct}%` }} title={`31-45 days: ${formatCurrency(summary?.due31To45)}`}></div>
          <div className="bg-red-500" style={{ width: `${bucketOver45Pct}%` }} title={`45+ days: ${formatCurrency(summary?.dueOver45)}`}></div>
        </div>
        <div className="grid grid-cols-4 text-sm text-center">
          <div>
            <p className="text-muted-foreground mb-1">0-15 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due0To15 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">16-30 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due16To30 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">31-45 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due31To45 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">45+ days</p>
            <p className="font-semibold tabular-nums text-red-600">{formatCurrency(summary?.dueOver45 || 0)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Customer Receivables</h2>
          <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading receivables...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadData} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && aging.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No customers with outstanding balances.
          </div>
        )}

        {!loading && !error && aging.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">Outstanding</th>
                  <th className="px-4 py-3 font-medium text-right">0-15d</th>
                  <th className="px-4 py-3 font-medium text-right">16-30d</th>
                  <th className="px-4 py-3 font-medium text-right">31-45d</th>
                  <th className="px-4 py-3 font-medium text-right">45d+</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((r) => (
                  <tr key={r.customerId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/customers/${r.customerId}`} className="hover:underline">
                        {r.customerName}
                      </Link>
                      {reminderFeedback?.customerId === r.customerId && (
                        <p role="status" className={`mt-1 max-w-[220px] text-[11px] font-medium leading-4 ${reminderFeedback?.kind === "success" ? "text-emerald-700" : "text-destructive"}`}>
                          {reminderFeedback?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-amber-600">{formatCurrency(r.totalOutstanding)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.due0To15)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.due16To30)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-orange-600">{formatCurrency(r.due31To45)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600 font-medium">{formatCurrency(r.dueOver45)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {can(PERMISSIONS.WHATSAPP_SEND) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
                            onClick={() => void sendOutstandingReminder(r.customerId)}
                            disabled={remindingCustomerId !== null}
                            aria-label={`Send outstanding reminder to ${r.customerName}`}
                            title="Send WhatsApp outstanding reminder"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            {remindingCustomerId === r.customerId ? "Sending…" : "Remind"}
                          </Button>
                        )}
                        <Link
                          href={`/receivables/receive-payment?customerId=${r.customerId}`}
                          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                        >
                          Receive
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
