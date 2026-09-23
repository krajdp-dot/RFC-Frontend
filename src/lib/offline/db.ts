/**
 * Phase 11 — durable client-side storage.
 *
 * A thin, promise-based wrapper over the browser's native IndexedDB, kept
 * dependency-free on purpose: this is the one piece of Phase 11 a bug in
 * would silently lose someone's sale, so it stays small enough to read in
 * one sitting rather than pulling in a library to audit instead. See
 * section 6 of the brief — "do not use localStorage as the transactional
 * queue" — this is IndexedDB specifically because it's transactional,
 * handles structured objects natively, and (unlike localStorage) has no
 * ~5MB practical ceiling that a season of mandi sales could hit.
 *
 * Two object stores:
 *   - "mutations": the offline queue (keyPath "mutationId")
 *   - "cache": cached master/operational data snapshots (keyPath "key")
 */

const DB_NAME = 'rfc-offline';
const DB_VERSION = 1;
export const MUTATIONS_STORE = 'mutations';
export const CACHE_STORE = 'cache';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MUTATIONS_STORE)) {
        const store = db.createObjectStore(MUTATIONS_STORE, { keyPath: 'mutationId' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // If another tab/connection needs to upgrade or delete this
      // database, don't sit there blocking it forever — close cleanly
      // and let the next caller here reopen. (This is also exactly what
      // was missing that made deleteDatabase() hang in tests: nothing
      // was ever closing the previous connection.)
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error('Failed to open the offline database.'));
    request.onblocked = () => reject(new Error('Offline database upgrade is blocked by another open tab.'));
  });

  return dbPromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

export async function dbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  return promisifyRequest(tx.objectStore(storeName).get(key));
}

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  return promisifyRequest(tx.objectStore(storeName).getAll());
}

export async function dbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(value);
  await promisifyTx(tx);
}

export async function dbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(key);
  await promisifyTx(tx);
}

function promisifyTx(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted.'));
  });
}

/** Test-only: closes the real connection (not just the cached promise) so a subsequent deleteDatabase() in a test's beforeEach doesn't hang waiting for it to close. Never called from app code. */
export async function __resetConnectionForTests(): Promise<void> {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      // Opening itself failed — nothing to close.
    }
  }
  dbPromise = null;
}
