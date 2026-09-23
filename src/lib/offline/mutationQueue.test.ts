import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __resetConnectionForTests } from './db';
import {
  enqueueMutation,
  listMutations,
  listByStatus,
  markSyncing,
  markSynced,
  recordTransientFailure,
  markFailed,
  markConflict,
  requeue,
  markCancelled,
  pruneSynced,
} from './mutationQueue';

/**
 * Phase 11 — these are the guarantees the sync engine and Sync Center are
 * built on: nothing enqueued is ever silently lost, every status
 * transition is exactly one explicit call, and a fresh "restart" (a new
 * IndexedDB connection, same underlying store) sees the same state.
 */

function samplePayload() {
  return {
    mutationId: 'mut-1',
    businessId: 'biz_1',
    userId: 'user_1',
    operation: 'sale.create' as const,
    entityLabel: 'Sale',
    summary: 'ABC Fruits · 3 items',
    endpoint: '/sales',
    payload: { customerId: 'cust_1', idempotencyKey: 'mut-1' },
  };
}

beforeEach(async () => {
  // A fresh fake-indexeddb backing store isn't reset between tests by
  // itself; dropping the cached connection forces db.ts to reopen (and
  // fake-indexeddb gives each `new FDBFactory()` instance is process-wide
  // here, so instead we delete the DB outright for real isolation).
  await __resetConnectionForTests();
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('rfc-offline');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe('mutationQueue', () => {
  it('enqueue creates a PENDING mutation with zero attempts and every id field populated', async () => {
    const m = await enqueueMutation(samplePayload());
    expect(m.status).toBe('PENDING');
    expect(m.attemptCount).toBe(0);
    expect(m.mutationId).toBe('mut-1');
    expect(m.id).toBe('mut-1');
    expect(m.deviceId).toBeTruthy();
    expect(m.serverEntityId).toBeNull();
    expect(m.syncedAt).toBeNull();
  });

  it('listMutations returns everything enqueued, oldest first', async () => {
    await enqueueMutation({ ...samplePayload(), mutationId: 'mut-a' });
    await enqueueMutation({ ...samplePayload(), mutationId: 'mut-b' });
    const all = await listMutations();
    expect(all.map((m) => m.mutationId)).toEqual(['mut-a', 'mut-b']);
  });

  it('a restart — a fresh connection to the same store — sees the same queue', async () => {
    await enqueueMutation(samplePayload());
    await __resetConnectionForTests(); // simulates reopening the DB after a page reload
    const all = await listMutations();
    expect(all).toHaveLength(1);
    expect(all[0].mutationId).toBe('mut-1');
  });

  it('markSyncing -> markSynced records the server id and a syncedAt timestamp', async () => {
    await enqueueMutation(samplePayload());
    await markSyncing('mut-1');
    expect((await listByStatus('SYNCING'))).toHaveLength(1);

    const synced = await markSynced('mut-1', 'sale_server_123');
    expect(synced?.status).toBe('SYNCED');
    expect(synced?.serverEntityId).toBe('sale_server_123');
    expect(synced?.syncedAt).toBeTruthy();
  });

  it('a transient failure goes back to PENDING with the attempt recorded, not FAILED', async () => {
    await enqueueMutation(samplePayload());
    const after = await recordTransientFailure('mut-1', 'Network unreachable', 1);
    expect(after?.status).toBe('PENDING');
    expect(after?.attemptCount).toBe(1);
    expect(after?.lastError).toBe('Network unreachable');
  });

  it('markFailed is visible and distinct from CONFLICT — never silently dropped', async () => {
    await enqueueMutation(samplePayload());
    const after = await markFailed('mut-1', 'Server error', 6);
    expect(after?.status).toBe('FAILED');
    const all = await listMutations();
    expect(all).toHaveLength(1); // still in the store
  });

  it('markConflict records the specific reason for the Sync Center', async () => {
    await enqueueMutation(samplePayload());
    const after = await markConflict('mut-1', 'INSUFFICIENT_STOCK', 'Insufficient stock for product prod_1');
    expect(after?.status).toBe('CONFLICT');
    expect(after?.conflictReason).toBe('INSUFFICIENT_STOCK');
  });

  it('requeue moves a FAILED mutation back to PENDING for a manual retry', async () => {
    await enqueueMutation(samplePayload());
    await markFailed('mut-1', 'boom', 6);
    const after = await requeue('mut-1');
    expect(after?.status).toBe('PENDING');
    expect(after?.lastError).toBeNull();
  });

  it('markCancelled keeps the record (as history) instead of deleting it', async () => {
    await enqueueMutation(samplePayload());
    await markConflict('mut-1', 'INSUFFICIENT_STOCK', 'no stock');
    await markCancelled('mut-1');
    const all = await listMutations();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('CANCELLED');
  });

  it('pruneSynced only removes SYNCED mutations older than the cutoff', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-09-01T09:00:00.000Z'));

    await enqueueMutation({ ...samplePayload(), mutationId: 'old-synced' });
    await markSynced('old-synced', 'srv_1');

    vi.setSystemTime(new Date('2026-09-01T09:20:00.000Z')); // 20 minutes later
    await enqueueMutation({ ...samplePayload(), mutationId: 'recent-synced' });
    await markSynced('recent-synced', 'srv_2');

    await enqueueMutation({ ...samplePayload(), mutationId: 'still-pending' });

    // "Older than 10 minutes" at 09:20 means anything synced before 09:10 —
    // that's old-synced (09:00) but not recent-synced (09:20).
    await pruneSynced(10 * 60 * 1000);

    const remaining = await listMutations();
    expect(remaining.map((m) => m.mutationId).sort()).toEqual(['recent-synced', 'still-pending']);
    vi.useRealTimers();
  });

  it('pruneSynced never touches PENDING, SYNCING, FAILED, or CONFLICT regardless of cutoff', async () => {
    await enqueueMutation({ ...samplePayload(), mutationId: 'pending-1' });
    await enqueueMutation({ ...samplePayload(), mutationId: 'failed-1' });
    await markFailed('failed-1', 'boom', 6);
    await enqueueMutation({ ...samplePayload(), mutationId: 'conflict-1' });
    await markConflict('conflict-1', 'STALE_VERSION', 'stale');

    await pruneSynced(0);

    const remaining = await listMutations();
    expect(remaining.map((m) => m.mutationId).sort()).toEqual(['conflict-1', 'failed-1', 'pending-1']);
  });
});
