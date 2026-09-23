/**
 * Phase 11, section 32 — a stable device id for diagnostics and mutation
 * tracking. Explicitly not personal information: a random UUID, generated
 * once and kept for the life of this browser install.
 *
 * This lives in localStorage, not the IndexedDB queue — section 6 says not
 * to use localStorage *as the transactional queue*, which this isn't. It's
 * a single, non-transactional value with no retry/status semantics; the
 * mutation queue itself is entirely in db.ts / mutationQueue.ts.
 */

const STORAGE_KEY = 'rfc_device_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server-side render pass — never persisted, never used for a real
    // mutation (those only happen client-side after hydration).
    return 'server';
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const generated = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    // Storage can throw (private browsing, quota, disabled storage). A
    // per-call fallback id means diagnostics degrade rather than the app
    // breaking — worse for debugging, never worse for correctness, since
    // mutationId (not deviceId) is what idempotency actually keys on.
    return `volatile-${crypto.randomUUID()}`;
  }
}
