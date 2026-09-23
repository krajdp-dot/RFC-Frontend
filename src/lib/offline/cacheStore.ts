import { dbGet, dbPut, CACHE_STORE } from './db';
import type { CacheEntry } from './types';

/**
 * Phase 11, sections 26-27 — master/operational data cache with a
 * freshness timestamp attached to every entry, so a page can say "showing
 * data from 12 minutes ago" honestly instead of pretending a cache hit is
 * a live read. Deliberately narrow: only what sales/payment entry needs
 * to function offline (customers, in-stock products, accounts) — not the
 * whole ERP (section 26: "do not cache the entire ERP unnecessarily").
 */

export async function setCache<T>(key: string, value: T): Promise<void> {
  const entry: CacheEntry<T> = { key, value, fetchedAt: new Date().toISOString() };
  await dbPut(CACHE_STORE, entry);
}

export async function getCache<T>(key: string): Promise<CacheEntry<T> | undefined> {
  return dbGet<CacheEntry<T>>(CACHE_STORE, key);
}

/** Minutes since this cache entry was written — for the "last updated Nm ago" label (section 27). Null if there is no entry yet. */
export function ageMinutes(entry: CacheEntry | undefined): number | null {
  if (!entry) return null;
  return Math.max(0, Math.round((Date.now() - new Date(entry.fetchedAt).getTime()) / 60000));
}

export function formatAge(entry: CacheEntry | undefined): string {
  const minutes = ageMinutes(entry);
  if (minutes === null) return 'never';
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m ago` : `${hours}h ago`;
}

/** Cache keys this app actually uses — centralized so a typo can't silently create two caches for the same data. */
export const CACHE_KEYS = {
  customers: 'master:customers',
  accounts: 'master:accounts',
  products: 'master:products',
} as const;
