"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useOffline } from "@/contexts/OfflineContext";
import { CACHE_KEYS, getCache, formatAge } from "@/lib/offline/cacheStore";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfflineMutation } from "@/lib/offline/types";

const REASON_COPY: Record<string, string> = {
  INSUFFICIENT_STOCK: "The stock changed since this was saved — there isn't enough left to complete it as entered.",
  STALE_VERSION: "Someone else's sale affected the same stock at nearly the same moment.",
  VALIDATION_ERROR: "The server rejected this — details below.",
  AUTH_REQUIRED: "Your session needs attention. Sign in again, then retry.",
  FORBIDDEN: "Your account no longer has permission to do this.",
  BUSINESS_MISMATCH: "This doesn't match the business your account is on now.",
  NOT_FOUND: "Something this referred to (a customer, a sale) no longer exists.",
  PERMANENT_FAILURE: "Something unexpected happened.",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusRow({
  mutation,
  onRetry,
  onCancel,
}: {
  mutation: OfflineMutation;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const { status, summary, entityLabel, createdAt, lastError, conflictReason, syncedAt, serverEntityId } = mutation;

  return (
    <div className="flex items-start justify-between gap-3 p-4 border-b last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{entityLabel}</span>
          {status === "SYNCED" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Synced
            </span>
          )}
          {(status === "PENDING" || status === "SYNCING") && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Waiting to sync
            </span>
          )}
          {status === "FAILED" && (
            <span className="inline-flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" /> Sync failed
            </span>
          )}
          {status === "CONFLICT" && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> Needs review
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{summary}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Created {formatTime(createdAt)}
          {syncedAt ? ` · Synced ${formatTime(syncedAt)}` : ""}
        </p>
        {status === "CONFLICT" && conflictReason && (
          <p className="text-xs text-amber-700 mt-1.5 max-w-md">{REASON_COPY[conflictReason] ?? lastError}</p>
        )}
        {status === "FAILED" && lastError && (
          <p className="text-xs text-destructive mt-1.5 max-w-md">{lastError}</p>
        )}
        {status === "SYNCED" && serverEntityId && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">{serverEntityId}</p>
        )}
      </div>

      {(status === "FAILED" || status === "CONFLICT") && (
        <div className="flex flex-col gap-1.5 shrink-0">
          {status === "FAILED" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onRetry(mutation.mutationId)}>
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => onCancel(mutation.mutationId)}
          >
            {status === "CONFLICT" ? "Discard" : "Cancel"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SyncCenterPage() {
  const { status, mutations, pendingCount, conflictCount, failedCount, triggerSync, retryMutation, cancelMutation } =
    useOffline();
  const [cacheAges, setCacheAges] = useState<{ customers: string; accounts: string; products: string }>({
    customers: "never",
    accounts: "never",
    products: "never",
  });

  useEffect(() => {
    (async () => {
      const [c, a, p] = await Promise.all([
        getCache(CACHE_KEYS.customers),
        getCache(CACHE_KEYS.accounts),
        getCache(CACHE_KEYS.products),
      ]);
      setCacheAges({ customers: formatAge(c), accounts: formatAge(a), products: formatAge(p) });
    })();
  }, [mutations]);

  const needsAttention = mutations.filter((m) => m.status === "CONFLICT" || m.status === "FAILED");
  const waiting = mutations.filter((m) => m.status === "PENDING" || m.status === "SYNCING");
  const recentlySynced = mutations
    .filter((m) => m.status === "SYNCED")
    .sort((a, b) => (b.syncedAt ?? "").localeCompare(a.syncedAt ?? ""))
    .slice(0, 10);

  const allClear = needsAttention.length === 0 && waiting.length === 0;

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-2xl mx-auto">
      <PageHeader
        title="Sync"
        subtitle="Sales and payments saved on this device, and what's happened to them."
        secondaryActions={[{ label: "Sync now", icon: RefreshCw, onClick: () => void triggerSync() }]}
      />

      <div className="flex items-center gap-2 text-sm">
        {status === "online" ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <Wifi className="h-4 w-4" /> Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <WifiOff className="h-4 w-4" /> {status === "backend-unreachable" ? "RFC can't be reached" : "Offline"}
          </span>
        )}
        {allClear && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" /> All synced
          </span>
        )}
      </div>

      {needsAttention.length > 0 && (
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-amber-50/50">
            <h2 className="font-semibold text-sm">Needs attention ({needsAttention.length})</h2>
          </div>
          {needsAttention.map((m) => (
            <StatusRow key={m.mutationId} mutation={m} onRetry={retryMutation} onCancel={cancelMutation} />
          ))}
        </section>
      )}

      {waiting.length > 0 && (
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Waiting to sync ({waiting.length})</h2>
          </div>
          {waiting.map((m) => (
            <StatusRow key={m.mutationId} mutation={m} onRetry={retryMutation} onCancel={cancelMutation} />
          ))}
        </section>
      )}

      {recentlySynced.length > 0 && (
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Recently synced</h2>
          </div>
          {recentlySynced.map((m) => (
            <StatusRow key={m.mutationId} mutation={m} onRetry={retryMutation} onCancel={cancelMutation} />
          ))}
        </section>
      )}

      {allClear && mutations.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Nothing has been queued on this device yet.
        </div>
      )}

      <section className="text-xs text-muted-foreground border-t pt-4">
        <p className="font-medium text-foreground mb-1">Offline data on this device</p>
        <p>Customers updated {cacheAges.customers} · Accounts updated {cacheAges.accounts} · Products updated {cacheAges.products}</p>
        <p className="mt-1">
          Sales and customer payments can be saved while offline. Everything else — purchases, expenses,
          reports, day close, and team management — needs a connection.
        </p>
      </section>
    </div>
  );
}
