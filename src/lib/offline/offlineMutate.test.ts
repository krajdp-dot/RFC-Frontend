import { describe, it, expect, vi, beforeEach } from 'vitest';
import { __resetConnectionForTests } from './db';
import { listMutations } from './mutationQueue';

vi.mock('../fetchApi', () => ({ fetchApi: vi.fn() }));
import { fetchApi } from '../fetchApi';
import { submitWithOfflineFallback } from './offlineMutate';

const mockedFetchApi = vi.mocked(fetchApi);

function input(overrides: Partial<Parameters<typeof submitWithOfflineFallback>[0]> = {}) {
  return {
    operation: 'sale.create' as const,
    endpoint: '/sales',
    payload: { customerId: 'cust_1', idempotencyKey: 'mut-1' },
    mutationId: 'mut-1',
    businessId: 'biz_1',
    userId: 'user_1',
    entityLabel: 'Sale',
    summary: 'ABC Fruits · 3 items',
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
});

describe('submitWithOfflineFallback', () => {
  it('a live success returns mode "live" with the server response, and enqueues nothing', async () => {
    mockedFetchApi.mockResolvedValue({ id: 'sale_server_1' });
    const result = await submitWithOfflineFallback(input());

    expect(result).toEqual({ mode: 'live', data: { id: 'sale_server_1' } });
    expect(await listMutations()).toHaveLength(0);
  });

  it('a network failure on an approved operation (sale.create) queues instead of throwing', async () => {
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('offline'), { isNetworkError: true }));
    const result = await submitWithOfflineFallback(input());

    expect(result.mode).toBe('queued');
    if (result.mode === 'queued') {
      expect(result.mutation.status).toBe('PENDING');
      expect(result.mutation.mutationId).toBe('mut-1');
      expect(result.mutation.payload).toEqual({ customerId: 'cust_1', idempotencyKey: 'mut-1' });
    }
    expect(await listMutations()).toHaveLength(1);
  });

  it('a network failure on an operation NOT in the capability matrix rethrows instead of queueing', async () => {
    mockedFetchApi.mockRejectedValue(Object.assign(new Error('offline'), { isNetworkError: true }));

    // "expense.create" is not a real OfflineOperation — cast to prove
    // submitWithOfflineFallback itself, not TypeScript, is the thing
    // refusing to queue an unapproved operation.
    await expect(
      submitWithOfflineFallback(input({ operation: 'expense.create' as any, endpoint: '/expenses' })),
    ).rejects.toThrow('offline');

    expect(await listMutations()).toHaveLength(0);
  });

  it('a validation failure (not a network failure) rethrows even for an approved operation — never silently queued', async () => {
    mockedFetchApi.mockRejectedValue(
      Object.assign(new Error('Insufficient stock for product prod_1'), { status: 400, code: 'INSUFFICIENT_STOCK' }),
    );

    await expect(submitWithOfflineFallback(input())).rejects.toThrow('Insufficient stock');
    expect(await listMutations()).toHaveLength(0);
  });

  it('a permission failure (403) rethrows — offline is never a way around RBAC (sections 26/29)', async () => {
    mockedFetchApi.mockRejectedValue(Object.assign(new Error("Your role doesn't allow this."), { status: 403 }));

    await expect(submitWithOfflineFallback(input())).rejects.toThrow("doesn't allow this");
    expect(await listMutations()).toHaveLength(0);
  });
});
