"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useOffline } from "@/contexts/OfflineContext";
import type { OfflineOperation } from "@/lib/offline/types";

/**
 * Phase 11, section 25 — a list page showing only server-confirmed rows
 * would silently make a just-created offline sale disappear from Sales
 * until it syncs. This doesn't merge it into the list (that would mean
 * fabricating a row with no real id, sale reference, or computed totals);
 * it says plainly that something is waiting, and links to where it can be
 * reviewed — never presenting a pending figure as if it were confirmed.
 */
export function OfflineQueueNotice({ operation, label }: { operation: OfflineOperation; label: string }) {
  const { mutations } = useOffline();
  const relevant = mutations.filter(
    (m) => m.operation === operation && (m.status === "PENDING" || m.status === "SYNCING"),
  );

  if (relevant.length === 0) return null;

  return (
    <Link
      href="/sync"
      className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-800 hover:bg-sky-100 transition-colors"
    >
      <Clock className="h-4 w-4 shrink-0" />
      <span>
        {relevant.length} {label}
        {relevant.length === 1 ? "" : "s"} saved on this device, waiting to sync
      </span>
    </Link>
  );
}
