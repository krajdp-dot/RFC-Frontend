import { dbGetAll, dbPut, dbDelete, MUTATIONS_STORE } from './db';
import { getDeviceId } from './deviceId';
import type { MutationStatus, OfflineMutation, OfflineOperation, ConflictReason } from './types';

/**
 * Phase 11 — the typed repository ("offlineRepository" in the brief's
 * naming) over the raw IndexedDB store. Nothing here talks to the network;
 * syncEngine.ts owns that. This module only owns: creating a mutation
 * record, and recording what happened to it.
 */

export interface EnqueueInput<TPayload> {
  mutationId: string;
  businessId: string;
  userId: string;
  operation: OfflineOperation;
  entityLabel: string;
  summary: string;
  endpoint: string;
  payload: TPayload;
}

export async function enqueueMutation<TPayload>(input: EnqueueInput<TPayload>): Promise<OfflineMutation<TPayload>> {
  const now = new Date().toISOString();
  const mutation: OfflineMutation<TPayload> = {
    id: input.mutationId,
    mutationId: input.mutationId,
    businessId: input.businessId,
    userId: input.userId,
    deviceId: getDeviceId(),
    operation: input.operation,
    entityLabel: input.entityLabel,
    summary: input.summary,
    payload: input.payload,
    endpoint: input.endpoint,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
    conflictReason: null,
    serverEntityId: null,
    syncedAt: null,
  };
  await dbPut(MUTATIONS_STORE, mutation);
  return mutation;
}

export async function listMutations(): Promise<OfflineMutation[]> {
  const all = await dbGetAll<OfflineMutation>(MUTATIONS_STORE);
  // Oldest first — the order the sync engine should generally send them in,
  // and the order a person reading the Sync Center expects too.
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listByStatus(status: MutationStatus): Promise<OfflineMutation[]> {
  const all = await listMutations();
  return all.filter((m) => m.status === status);
}

async function patch(mutationId: string, changes: Partial<OfflineMutation>): Promise<OfflineMutation | undefined> {
  const all = await dbGetAll<OfflineMutation>(MUTATIONS_STORE);
  const existing = all.find((m) => m.mutationId === mutationId);
  if (!existing) return undefined;
  const updated: OfflineMutation = { ...existing, ...changes, updatedAt: new Date().toISOString() };
  await dbPut(MUTATIONS_STORE, updated);
  return updated;
}

export function markSyncing(mutationId: string) {
  return patch(mutationId, { status: 'SYNCING' });
}

export function markSynced(mutationId: string, serverEntityId: string) {
  return patch(mutationId, {
    status: 'SYNCED',
    serverEntityId,
    syncedAt: new Date().toISOString(),
    lastError: null,
  });
}

/** Transient failure — stays retryable. Goes back to PENDING, not FAILED, so the sync engine picks it up again on the next pass. */
export function recordTransientFailure(mutationId: string, error: string, attemptCount: number) {
  return patch(mutationId, {
    status: 'PENDING',
    attemptCount,
    lastAttemptAt: new Date().toISOString(),
    lastError: error,
  });
}

/** Exhausted retries on something that was never going to succeed on its own (unexpected 5xx, etc). Still visible, still manually retryable — never silently dropped (section 13.12). */
export function markFailed(mutationId: string, error: string, attemptCount: number) {
  return patch(mutationId, {
    status: 'FAILED',
    attemptCount,
    lastAttemptAt: new Date().toISOString(),
    lastError: error,
  });
}

export function markConflict(mutationId: string, reason: ConflictReason, error: string) {
  return patch(mutationId, {
    status: 'CONFLICT',
    conflictReason: reason,
    lastAttemptAt: new Date().toISOString(),
    lastError: error,
  });
}

/** Manual retry from the Sync Center — moves a FAILED (never a CONFLICT) mutation back to PENDING, with a clean attempt history so it's tried on the very next pass rather than still serving out backoff computed from the failures that led to FAILED. Conflicts need Cancel, not Retry — see markCancelled. */
export function requeue(mutationId: string) {
  return patch(mutationId, { status: 'PENDING', lastError: null, attemptCount: 0, lastAttemptAt: null });
}

/** A person looked at a CONFLICT/FAILED item and decided not to send it. Kept in the store as CANCELLED (visible history) rather than deleted — never silently disappears. */
export function markCancelled(mutationId: string) {
  return patch(mutationId, { status: 'CANCELLED' });
}

/** Housekeeping only — clears mutations already SYNCED more than `olderThanMs` ago. Never removes anything still PENDING/SYNCING/FAILED/CONFLICT. */
export async function pruneSynced(olderThanMs: number): Promise<void> {
  const all = await listMutations();
  const cutoff = Date.now() - olderThanMs;
  for (const m of all) {
    if (m.status === 'SYNCED' && m.syncedAt && new Date(m.syncedAt).getTime() < cutoff) {
      await dbDelete(MUTATIONS_STORE, m.mutationId);
    }
  }
}
