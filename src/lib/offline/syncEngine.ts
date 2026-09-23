import { fetchApi } from '../fetchApi';
import { connectivityMonitor } from './connectivity';
import {
  listMutations,
  markSyncing,
  markSynced,
  recordTransientFailure,
  markFailed,
  markConflict,
  pruneSynced,
} from './mutationQueue';
import { classifyError, conflictReasonFor, friendlyMessage } from './errorMapping';
import type { OfflineMutation } from './types';

/**
 * Phase 11, section 13 — the sync engine. Deterministic, restart-safe,
 * idempotent, observable, per the brief's own requirements:
 *
 *   deterministic  — same queue state always produces the same actions
 *   restart-safe   — reads everything fresh from IndexedDB every pass;
 *                    holds no state that matters across a page reload
 *   idempotent     — every send reuses the mutation's original mutationId
 *                    as idempotencyKey, so a retry after a lost response
 *                    can never create a second sale/payment
 *   observable     — every outcome is a status write a subscriber can see
 *
 * One mutation in flight at a time, in creation order. Not parallelized:
 * a mandi salesman's connection is the scarce resource here, and ordering
 * mutations lets a later sale's stock check see an earlier sale's stock
 * deduction land first, which is closer to what actually happened in the
 * field than firing both at once.
 */

const MAX_AUTO_ATTEMPTS = 6;
const BASE_BACKOFF_MS = 5000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;

function backoffDelay(attemptCount: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** attemptCount, MAX_BACKOFF_MS);
}

function isEligibleNow(mutation: OfflineMutation): boolean {
  if (!mutation.lastAttemptAt) return true;
  const elapsed = Date.now() - new Date(mutation.lastAttemptAt).getTime();
  return elapsed >= backoffDelay(mutation.attemptCount);
}

export interface SyncPassResult {
  attempted: number;
  synced: number;
  conflicted: number;
  failed: number;
  stillPending: number;
}

let passInFlight: Promise<SyncPassResult> | null = null;

/** Runs one pass over the queue. Safe to call repeatedly — a pass already running is returned instead of starting a second one. */
export function runSyncPass(): Promise<SyncPassResult> {
  if (passInFlight) return passInFlight;
  passInFlight = executePass().finally(() => {
    passInFlight = null;
  });
  return passInFlight;
}

async function executePass(): Promise<SyncPassResult> {
  const result: SyncPassResult = { attempted: 0, synced: 0, conflicted: 0, failed: 0, stillPending: 0 };

  const connectivity = await connectivityMonitor.checkNow();
  if (connectivity !== 'online') {
    return result;
  }

  // Housekeeping: drop SYNCED history older than a week. Cheap (a full
  // scan of a small table) and only runs while we're online anyway.
  await pruneSynced(7 * 24 * 60 * 60 * 1000).catch(() => {});

  const all = await listMutations();
  // Restart-safety: a mutation stuck in SYNCING means the tab closed or
  // crashed mid-request last time. Retrying it is safe — the request
  // either never reached the server (nothing to duplicate) or it did and
  // the same mutationId will just return the original result (nothing to
  // duplicate either way).
  const runnable = all.filter((m) => m.status === 'PENDING' || m.status === 'SYNCING');

  for (const mutation of runnable) {
    if (!isEligibleNow(mutation)) {
      result.stillPending++;
      continue;
    }

    result.attempted++;
    await markSyncing(mutation.mutationId);

    try {
      const response = await fetchApi(
        mutation.endpoint,
        { method: 'POST', body: JSON.stringify(mutation.payload) },
        { redirectOn401: false },
      );
      await markSynced(mutation.mutationId, response?.id ?? mutation.mutationId);
      result.synced++;
    } catch (err) {
      const cls = classifyError(err);
      const attemptCount = mutation.attemptCount + 1;
      const message = friendlyMessage(err, mutation.entityLabel.toLowerCase());

      if (cls === 'NETWORK') {
        // Connectivity dropped again mid-pass. Stop the whole pass rather
        // than burning through every remaining mutation's attempt budget
        // against a connection that just proved itself down.
        await recordTransientFailure(mutation.mutationId, message, attemptCount);
        result.stillPending++;
        break;
      }

      if (cls === 'AUTH') {
        // Sections 29-30: the session is expired or the role/membership
        // was revoked while this device was offline. The server's answer
        // wins — never bypassed — and the mutation is neither dropped nor
        // silently retried; it waits for a person to sign back in.
        await markConflict(mutation.mutationId, 'AUTH_REQUIRED', message);
        result.conflicted++;
        continue;
      }

      if (cls === 'CONFLICT') {
        await markConflict(mutation.mutationId, conflictReasonFor(err), message);
        result.conflicted++;
        continue;
      }

      // PERMANENT: an unexpected error (5xx, etc). Keep retrying with
      // backoff up to a point, then stop and let a person decide — never
      // silently drop it, and never hammer a struggling server forever.
      if (attemptCount >= MAX_AUTO_ATTEMPTS) {
        await markFailed(mutation.mutationId, message, attemptCount);
        result.failed++;
      } else {
        await recordTransientFailure(mutation.mutationId, message, attemptCount);
        result.stillPending++;
      }
    }
  }

  return result;
}

let periodicHandle: ReturnType<typeof setInterval> | null = null;
let unsubscribeConnectivity: (() => void) | null = null;

/** Starts the background loop: on connectivity restored, and on a periodic tick that respects each mutation's own backoff. Call once, from OfflineProvider. */
export function startSyncEngine() {
  if (periodicHandle) return;
  connectivityMonitor.start();

  unsubscribeConnectivity = connectivityMonitor.subscribe((status) => {
    if (status === 'online') void runSyncPass();
  });

  periodicHandle = setInterval(() => void runSyncPass(), BASE_BACKOFF_MS);
  void runSyncPass();
}

export function stopSyncEngine() {
  if (periodicHandle) clearInterval(periodicHandle);
  periodicHandle = null;
  unsubscribeConnectivity?.();
  unsubscribeConnectivity = null;
}
