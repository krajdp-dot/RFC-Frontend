import type { OfflineOperation } from './types';

/**
 * Phase 11, section 10 — the offline capability matrix, decided against
 * this codebase's actual architecture rather than the brief's example
 * table. Two operations are approved for this pass. Everything else is
 * evaluated and explicitly kept online-only, with the reason recorded
 * here rather than left as an unstated omission — section 22: "If [an]
 * operation cannot be made safe, keep it online-only. Document why."
 *
 * "Approved" means: backend idempotency already exists and is proven
 * (createSale / receivePayment — see sales.service.spec.ts and
 * payments.service.spec.ts), the mutation has no same-request dependency
 * on something else that might also be offline (a sale needs an existing
 * customer, never a customer created in the same flow), and a conflict at
 * sync time has a safe, well-defined resolution (surface to a person,
 * touch nothing automatically).
 */
export const CAPABILITY_MATRIX: Record<
  string,
  { offline: boolean; operation?: OfflineOperation; reason: string }
> = {
  'Sales': {
    offline: true,
    operation: 'sale.create',
    reason:
      'The primary field operation (section 11). createSale already has a DB-unique idempotencyKey with check-then-return semantics, and running out of stock at sync time is now a distinct INSUFFICIENT_STOCK code the sync engine can route to CONFLICT instead of guessing.',
  },
  'Customer Payment': {
    offline: true,
    operation: 'payment.receive',
    reason:
      'Field collection — the second scenario the brief names explicitly (section 21). receivePayment has the same idempotency pattern, already covered by existing tests (payments.service.spec.ts).',
  },
  'Supplier Payment': {
    offline: false,
    reason:
      'Has the identical idempotency pattern as customer payment (makePayment) and could be added the same way later, but a mandi salesman in the field collects from customers — paying a supplier is an office action with someone normally already online. Kept online-only this pass for scope, not because it is architecturally harder.',
  },
  'Purchase': {
    offline: false,
    reason:
      'Also has DB-backed idempotency already (Purchase.idempotencyKey, unique) but purchases happen at intake with the supplier present and a scale/count to verify — not a disconnected-field scenario the way a sale is. Kept online-only; revisit if a real field-purchase workflow shows up.',
  },
  'Expense': {
    offline: false,
    reason:
      'No idempotencyKey / unique constraint exists on the expense-creation path today. Adding one is the same small change as the others, but it has not been done or proven in this pass, and section 22 is explicit: if it cannot be made safe, keep it online-only rather than assume the pattern transfers untested.',
  },
  'Inventory Adjustment': {
    offline: false,
    reason:
      'Section 10 calls this out directly — high conflict risk. An adjustment is a correction against whatever the count turns out to be at the moment it is made; queuing one against a stock figure that may be hours stale is a substantively different, riskier operation than a sale (which the server can reject cleanly) — a stale adjustment could silently overcorrect. Not attempted.',
  },
  'Returns / Refunds': {
    offline: false,
    reason:
      'Depends on the original sale still being in the state the field device last saw it in (not already returned, not already fully refunded) — a second layer of staleness beyond plain stock, on top of not having its own idempotency key yet. Out of scope this pass.',
  },
  'Lot Receiving': {
    offline: false,
    reason:
      'Happens at goods-in with the physical lot in hand and a scale/count to verify against the system — an online, at-the-warehouse action by design, not a field operation.',
  },
  'Day Close': {
    offline: false,
    reason:
      'Explicitly online-only per section 23 — depends on server-wide financial state across every user and device; there is no safe offline version of "reconcile everything".',
  },
  'User Management / Role Changes': {
    offline: false,
    reason:
      'Explicitly excluded per sections 10, 29 and 30 — security-sensitive, and Phase 10\'s RBAC already re-authorizes every request from the database on every call. Offline must never be a way to act with permissions that would be refused online.',
  },
  'Reports / Analytics / Dashboard': {
    offline: false,
    reason:
      'Not mutations, so "offline capability" does not apply the same way — these are cached-snapshot reads (section 24-25: a stale snapshot must say so, never look live), not queued writes. See cacheStore.ts.',
  },
};

export function capabilityFor(operation: OfflineOperation): { offline: boolean; reason: string } {
  const entry = Object.values(CAPABILITY_MATRIX).find((e) => e.operation === operation);
  return entry ? { offline: entry.offline, reason: entry.reason } : { offline: false, reason: 'Unknown operation.' };
}
