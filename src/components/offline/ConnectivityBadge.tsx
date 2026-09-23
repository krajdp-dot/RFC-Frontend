"use client";

import Link from "next/link";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useOffline } from "@/contexts/OfflineContext";

/**
 * Phase 11, section 35 — a subtle, persistent connectivity indicator,
 * matching this app's own design language (a small pill, same family as
 * the role badge in the sidebar) rather than a generic PWA-template toast.
 *
 * Mobile-first on purpose (section 36): this app is used one-handed in a
 * mandi, so the badge stays a compact pill at every state and never grows
 * into a banner that pushes the header's other controls around.
 */
export function ConnectivityBadge() {
  const { status, pendingCount, conflictCount, failedCount } = useOffline();
  const needsAttention = conflictCount + failedCount > 0;

  let icon = <Wifi className="h-3.5 w-3.5" />;
  let label = "Online";
  let tone = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (needsAttention) {
    icon = <AlertTriangle className="h-3.5 w-3.5" />;
    label = `${conflictCount + failedCount} need${conflictCount + failedCount === 1 ? "s" : ""} attention`;
    tone = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (status !== "online" && pendingCount > 0) {
    icon = <WifiOff className="h-3.5 w-3.5" />;
    label = `Offline · ${pendingCount} waiting`;
    tone = "bg-muted text-muted-foreground border-border";
  } else if (status === "online" && pendingCount > 0) {
    icon = <RefreshCw className="h-3.5 w-3.5 animate-spin" />;
    label = `Syncing ${pendingCount}`;
    tone = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (status !== "online") {
    icon = <WifiOff className="h-3.5 w-3.5" />;
    label = "Offline";
    tone = "bg-muted text-muted-foreground border-border";
  }

  return (
    <Link
      href="/sync"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 ${tone}`}
      title="Open Sync Center"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
