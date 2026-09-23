"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { connectivityMonitor } from "@/lib/offline/connectivity";
import { startSyncEngine, runSyncPass } from "@/lib/offline/syncEngine";
import { listMutations, requeue, markCancelled } from "@/lib/offline/mutationQueue";
import type { ConnectivityStatus, OfflineMutation } from "@/lib/offline/types";

/**
 * Phase 11 — the single app-wide source of offline/sync state. Mounted
 * once in Shell.tsx, alongside AuthContext, so the connectivity badge,
 * the Sync Center, and any page that wants a "N pending" count all read
 * the same live queue instead of each polling IndexedDB separately.
 *
 * Reactivity here is short-interval polling of IndexedDB (every 3s) plus
 * an immediate refresh after any action that changes the queue, rather
 * than a dedicated event bus — the queue is small (a field salesperson's
 * day, not a firehose), so this stays simple without a real staleness
 * cost. See docs/PHASE-11-OFFLINE-ARCHITECTURE.md.
 */

interface OfflineContextValue {
  status: ConnectivityStatus;
  mutations: OfflineMutation[];
  pendingCount: number;
  conflictCount: number;
  failedCount: number;
  refresh: () => Promise<void>;
  triggerSync: () => Promise<void>;
  retryMutation: (mutationId: string) => Promise<void>;
  cancelMutation: (mutationId: string) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

const POLL_MS = 3000;

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectivityStatus>("offline");
  const [mutations, setMutations] = useState<OfflineMutation[]>([]);

  const refresh = useCallback(async () => {
    try {
      setMutations(await listMutations());
    } catch {
      // IndexedDB can be unavailable (private browsing, disabled storage).
      // The rest of the app must keep working online — offline mode just
      // silently isn't available, rather than breaking the page.
    }
  }, []);

  useEffect(() => {
    startSyncEngine();
    setStatus(connectivityMonitor.getStatus());
    void refresh();

    const unsubscribe = connectivityMonitor.subscribe(setStatus);
    const poll = setInterval(() => void refresh(), POLL_MS);

    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [refresh]);

  const triggerSync = useCallback(async () => {
    await runSyncPass();
    await refresh();
  }, [refresh]);

  const retryMutation = useCallback(
    async (mutationId: string) => {
      await requeue(mutationId);
      await refresh();
      void runSyncPass().then(refresh);
    },
    [refresh],
  );

  const cancelMutation = useCallback(
    async (mutationId: string) => {
      await markCancelled(mutationId);
      await refresh();
    },
    [refresh],
  );

  const pendingCount = mutations.filter((m) => m.status === "PENDING" || m.status === "SYNCING").length;
  const conflictCount = mutations.filter((m) => m.status === "CONFLICT").length;
  const failedCount = mutations.filter((m) => m.status === "FAILED").length;

  return (
    <OfflineContext.Provider
      value={{ status, mutations, pendingCount, conflictCount, failedCount, refresh, triggerSync, retryMutation, cancelMutation }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error("useOffline() must be called within <OfflineProvider>.");
  }
  return ctx;
}
