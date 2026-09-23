import type { ConflictReason, ErrorClass } from './types';

/**
 * Phase 11, section 53 — reduces whatever fetchApi throws down to one of
 * four buckets the sync engine and the offline-submit helper both act on.
 * This is the one place that decision gets made, so the mapping only has
 * to be right once.
 *
 *   NETWORK   — never reached the server; queue it / retry it later
 *   AUTH      — 401/403; per sections 29-30, must surface, never bypass
 *   CONFLICT  — the server understood the request and refused it because
 *               the world changed (stock, an already-settled payment, a
 *               deleted customer); needs a person, not a retry
 *   PERMANENT — anything else unexpected (5xx, validation shape errors);
 *               stays visible and retryable, but isn't auto-retried forever
 */
export function classifyError(err: unknown): ErrorClass {
  const e = err as { isNetworkError?: boolean; status?: number; code?: string } | undefined;
  if (!e) return 'PERMANENT';
  if (e.isNetworkError) return 'NETWORK';
  if (e.status === 401 || e.status === 403) return 'AUTH';
  if (e.status && e.status >= 400 && e.status < 500) return 'CONFLICT';
  return 'PERMANENT';
}

/** Only meaningful when classifyError() returned CONFLICT — picks the specific reason for the Sync Center. */
export function conflictReasonFor(err: unknown): ConflictReason {
  const e = err as { code?: string; status?: number } | undefined;
  switch (e?.code) {
    case 'INSUFFICIENT_STOCK':
      return 'INSUFFICIENT_STOCK';
    case 'STALE_VERSION':
      return 'STALE_VERSION';
    case 'NOT_FOUND':
      return 'NOT_FOUND';
    default:
      return e?.status === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR';
  }
}

/**
 * Section 38 — never show a person AxiosError / PrismaClientKnownRequestError
 * / a bare status code. The server's own message already reads fine for
 * CONFLICT (it already went through this same rewrite for stock — see
 * sales.service.ts) and AUTH (fetchApi already rewrites 403 in Phase 10);
 * this only needs to add copy for the cases those don't cover.
 */
export function friendlyMessage(err: unknown, fallbackContext: string): string {
  const cls = classifyError(err);
  const e = err as { message?: string } | undefined;

  if (cls === 'NETWORK') {
    return `Couldn't reach RFC. Your ${fallbackContext} is safely saved and will sync automatically.`;
  }
  if (cls === 'AUTH') {
    return e?.message || 'Your session needs attention. Please sign in again.';
  }
  // CONFLICT and PERMANENT: the backend's own message is already
  // human-written for every case this codebase actually throws (see
  // sales.service.ts / payments.service.ts) — pass it through rather than
  // re-wrapping it into something vaguer.
  return e?.message || `Something went wrong while saving this ${fallbackContext}.`;
}
