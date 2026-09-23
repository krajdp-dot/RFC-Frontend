import { describe, it, expect } from 'vitest';
import { CAPABILITY_MATRIX, capabilityFor } from './capabilityMatrix';

describe('capability matrix', () => {
  it('every entry documents a reason, whether approved or not', () => {
    for (const [name, entry] of Object.entries(CAPABILITY_MATRIX)) {
      expect(entry.reason.length, `${name} has no reason recorded`).toBeGreaterThan(20);
    }
  });

  it('exactly the two flagship operations are approved for offline', () => {
    const approved = Object.entries(CAPABILITY_MATRIX)
      .filter(([, e]) => e.offline)
      .map(([name]) => name)
      .sort();
    expect(approved).toEqual(['Customer Payment', 'Sales']);
  });

  it('day close, user management, and inventory adjustment are explicitly NOT offline-capable', () => {
    expect(CAPABILITY_MATRIX['Day Close'].offline).toBe(false);
    expect(CAPABILITY_MATRIX['User Management / Role Changes'].offline).toBe(false);
    expect(CAPABILITY_MATRIX['Inventory Adjustment'].offline).toBe(false);
  });

  it('capabilityFor resolves the operation strings the rest of the offline lib actually uses', () => {
    expect(capabilityFor('sale.create').offline).toBe(true);
    expect(capabilityFor('payment.receive').offline).toBe(true);
  });

  it('every approved entry declares the operation string capabilityFor looks up', () => {
    for (const [name, entry] of Object.entries(CAPABILITY_MATRIX)) {
      if (entry.offline) {
        expect(entry.operation, `${name} is offline:true but has no operation id`).toBeTruthy();
      }
    }
  });
});
