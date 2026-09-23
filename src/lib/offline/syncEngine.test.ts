import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { __resetConnectionForTests } from './db';
import { enqueueMutation, listMutations, markFailed } from './mutationQueue';

// Mocked before importing syncEngine, so syncEngine picks up the mocks.
vi.mock('../fetchApi', () => ({ fetchApi: vi.fn() }));
vi.mock('./connectivity', () => ({
  connectivityMonitor: {
    checkNow: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    start: vi.fn(),
    getStatus: vi.fn(() => 'online'),
  },
}));

import { fetchApi } from '../fetchApi';
import { connectivityMonitor } from './connectivity';
import { runSyncPass } from './syncEngine';

const mockedFetchApi = vi.mocked(fetchApi);
const mockedCheckNow = vi.mocked(connectivityMonitor.checkNow);

function sample(overrides: Partial<Parameters<typeof enqueueMutation>[0]> = {}) {
  return {
    mutationId: 'mut-1',
    businessId: 'biz_1',
    userId: 'user_1',
    operation: 'sale.create' as const,
    entityLabel: 'Sale',
    summary: 'ABC Fruits · 3 items',
    endpoint: '/sales',
    payload: { customerId: 'cust_1', idempotencyKey: 'mut-1' },
    ...overrides,
  };
}

beforeEach(async () => {
  await __resetConnectionForTests();
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('rfc-offline');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
  mockedFetchApi.mockReset();
  mockedCheckNow.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('syncEngine — connectivity gate', () => {
  it('never calls fetchApi when connectivity check says offline', async () => {
    mockedCheckNow.mockResolvedValue('offline');
    await enqueueMutation(sample());

    const result = await runSyncPass();

    expect(mockedFetchApi).not.toHaveBeenCalled();
    expect(result).toMatchObject({ attempted: 0, synced: 0 });
    const [m] = await listMutations();
    expect(m.status).toBe('PENDING');
  });
});

describe('syncEngine — success path', () => {
  it('POSTs the exact stored payload to the exact stored endpoint and marks SYNCED', async () => {
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockResolvedValue({ id: 'sale_server_123' });
    await enqueueMutation(sample());

    const result = await runSyncPass();

    expect(mockedFetchApi).toHaveBeenCalledTimes(1);
    const [endpoint, options, config] = mockedFetchApi.mock.calls[0];
    expect(endpoint).toBe('/sales');
    expect(JSON.parse(options!.body as string)).toEqual({ customerId: 'cust_1', idempotencyKey: 'mut-1' });
    // Never triggers the app-wide 401 redirect from a background pass (sections 29-30).
    expect(config).toEqual({ redirectOn401: false });

    expect(result.synced).toBe(1);
    const [m] = await listMutations();
    expect(m.status).toBe('SYNCED');
    expect(m.serverEntityId).toBe('sale_server_123');
  });
});

describe('syncEngine — network failure', () => {
  it('leaves the mutation PENDING, records the attempt, and stops the rest of the pass', async () => {
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('offline'), { isNetworkError: true }));

    await enqueueMutation(sample({ mutationId: 'mut-1' }));
    await enqueueMutation(sample({ mutationId: 'mut-2' }));

    const result = await runSyncPass();

    // Stops after the first network failure rather than burning through
    // every remaining mutation against a connection that just proved down.
    expect(mockedFetchApi).toHaveBeenCalledTimes(1);
    expect(result.stillPending).toBe(1);

    const all = await listMutations();
    const first = all.find((m) => m.mutationId === 'mut-1')!;
    const second = all.find((m) => m.mutationId === 'mut-2')!;
    expect(first.status).toBe('PENDING');
    expect(first.attemptCount).toBe(1);
    expect(second.status).toBe('PENDING');
    expect(second.attemptCount).toBe(0); // never attempted this pass
  });
});

describe('syncEngine — conflict classification', () => {
  it('an INSUFFICIENT_STOCK rejection marks CONFLICT with that reason, and is not retried on the next pass', async () => {
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(
      Object.assign(new Error('Insufficient stock for product prod_1'), {
        status: 400,
        code: 'INSUFFICIENT_STOCK',
      }),
    );
    await enqueueMutation(sample());

    await runSyncPass();
    const [m] = await listMutations();
    expect(m.status).toBe('CONFLICT');
    expect(m.conflictReason).toBe('INSUFFICIENT_STOCK');

    mockedFetchApi.mockClear();
    await runSyncPass(); // a second pass must not touch a CONFLICT mutation
    expect(mockedFetchApi).not.toHaveBeenCalled();
  });

  it('a 401 (expired/revoked session) marks CONFLICT as AUTH_REQUIRED — never silently dropped, never auto-bypassed', async () => {
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    await enqueueMutation(sample());

    await runSyncPass();
    const [m] = await listMutations();
    expect(m.status).toBe('CONFLICT');
    expect(m.conflictReason).toBe('AUTH_REQUIRED');
  });
});

describe('syncEngine — permanent failure & backoff', () => {
  it('retries a 5xx with backoff and marks FAILED only after the attempt budget is exhausted', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('Internal error'), { status: 500 }));

    await enqueueMutation(sample());

    // First attempt — still under budget, stays PENDING for a later retry.
    await runSyncPass();
    let [m] = await listMutations();
    expect(m.status).toBe('PENDING');
    expect(m.attemptCount).toBe(1);

    // Immediately running again must NOT re-attempt — backoff hasn't elapsed.
    mockedFetchApi.mockClear();
    await runSyncPass();
    expect(mockedFetchApi).not.toHaveBeenCalled();

    // Fast-forward past backoff and exhaust the remaining attempt budget.
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(6 * 60 * 1000); // past the 5-minute backoff ceiling
      await runSyncPass();
    }

    [m] = await listMutations();
    expect(m.status).toBe('FAILED');
    expect(m.attemptCount).toBe(6);
    expect(m.lastError).toContain('Internal error');
  }, 15000);

  it('a mutation is never deleted on failure — always visible in the store', async () => {
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));
    await enqueueMutation(sample());
    await runSyncPass();
    const all = await listMutations();
    expect(all).toHaveLength(1);
  });
});

describe('syncEngine — manual retry', () => {
  it('requeuing a FAILED mutation lets it sync normally on the next pass', async () => {
    mockedCheckNow.mockResolvedValue('online');
    await enqueueMutation(sample());
    await markFailed('mut-1', 'boom', 6);

    const { requeue } = await import('./mutationQueue');
    await requeue('mut-1');

    mockedFetchApi.mockResolvedValue({ id: 'srv_ok' });
    await runSyncPass();

    const [m] = await listMutations();
    expect(m.status).toBe('SYNCED');
  });
});

describe('syncEngine — idempotent retries', () => {
  it('sends the identical mutationId/payload on every attempt — nothing is ever regenerated', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockedCheckNow.mockResolvedValue('online');
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('offline'), { isNetworkError: true }));
    await enqueueMutation(sample());

    await runSyncPass();
    const firstBody = JSON.parse(mockedFetchApi.mock.calls[0][1]!.body as string);

    vi.advanceTimersByTime(6 * 60 * 1000);
    await runSyncPass();
    const secondBody = JSON.parse(mockedFetchApi.mock.calls[1][1]!.body as string);

    expect(firstBody).toEqual(secondBody);
    expect(firstBody.idempotencyKey).toBe('mut-1');
  });
});
