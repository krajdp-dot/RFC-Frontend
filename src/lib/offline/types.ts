/**
 * Phase 11 — offline mutation queue types.
 *
 * This is the "OfflineMutation" model the Phase 11 brief describes,
 * adapted to what this codebase actually needs rather than implemented
 * literally. Notably: there is no separate `serverVersion` field, because
 * nothing here does optimistic field-level merging — a synced mutation
 * either becomes the real server row (whose id is `serverEntityId`) or it
 * becomes a CONFLICT that a person resolves. See
 * docs/PHASE-11-OFFLINE-ARCHITECTURE.md for the reasoning.
 */

/** The two operations approved for offline queueing — see capabilityMatrix.ts for why these two and not more. */
export type OfflineOperation = 'sale.create' | 'payment.receive';

/**
 * DRAFT never actually appears in the queue (a mutation is only enqueued
 * once the person has already submitted it) — kept in the union because
 * the brief calls for it and a future "save for later, don't send yet"
 * mode would need it. Every other state below is real and reachable.
 */
export type MutationStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT'
  | 'CANCELLED';

/**
 * Why a mutation stopped at CONFLICT or FAILED instead of syncing cleanly.
 * Mirrors the backend's error `code` where one exists (INSUFFICIENT_STOCK,
 * STALE_VERSION); AUTH_REQUIRED / FORBIDDEN / BUSINESS_MISMATCH cover
 * section 29-31 (role changed or access revoked while offline); anything
 * else the server rejects as a 4xx lands under VALIDATION_ERROR.
 */
export type ConflictReason =
  | 'INSUFFICIENT_STOCK'
  | 'STALE_VERSION'
  | 'VALIDATION_ERROR'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'BUSINESS_MISMATCH'
  | 'NOT_FOUND'
  | 'PERMANENT_FAILURE';

export interface OfflineMutation<TPayload = Record<string, unknown>> {
  /** Same value as mutationId — kept as its own field only because the brief's model names both; this codebase never lets them diverge. */
  id: string;
  /** Stable across every retry — this literally IS the payload's idempotencyKey, generated once at creation time. */
  mutationId: string;
  businessId: string;
  userId: string;
  deviceId: string;
  operation: OfflineOperation;
  /** What the person will see it as in the Sync Center — "Sale" / "Payment". */
  entityLabel: string;
  /** A short human summary — "ABC Fruits · 3 boxes · ₹6,150" — computed once at enqueue time so the Sync Center doesn't need the full cache to render a list. */
  summary: string;
  /** The exact request body that will be POSTed, idempotencyKey included. */
  payload: TPayload;
  /** The API path this mutation POSTs to — reusing the existing endpoint, per section 52 ("offline is a delivery mode, not a second API"). */
  endpoint: string;
  status: MutationStatus;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  conflictReason: ConflictReason | null;
  /** Set once SYNCED — the real id the server assigned. */
  serverEntityId: string | null;
  syncedAt: string | null;
}

export type ConnectivityStatus = 'online' | 'backend-unreachable' | 'offline';

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  fetchedAt: string;
}

/** What classifyError() reduces a failed request down to, before the sync engine decides what to do about it. */
export type ErrorClass = 'NETWORK' | 'CONFLICT' | 'AUTH' | 'PERMANENT';
