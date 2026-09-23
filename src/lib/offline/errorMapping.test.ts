import { describe, it, expect } from 'vitest';
import { classifyError, conflictReasonFor, friendlyMessage } from './errorMapping';

function err(props: Record<string, unknown>) {
  const e = new Error((props.message as string) || 'test error');
  return Object.assign(e, props);
}

describe('classifyError', () => {
  it('a fetchApi network-level failure is NETWORK', () => {
    expect(classifyError(err({ isNetworkError: true, code: 'NETWORK_ERROR' }))).toBe('NETWORK');
  });

  it('401 and 403 are AUTH', () => {
    expect(classifyError(err({ status: 401 }))).toBe('AUTH');
    expect(classifyError(err({ status: 403 }))).toBe('AUTH');
  });

  it('any other 4xx is CONFLICT — the server understood the request and refused it', () => {
    expect(classifyError(err({ status: 400 }))).toBe('CONFLICT');
    expect(classifyError(err({ status: 404 }))).toBe('CONFLICT');
    expect(classifyError(err({ status: 409 }))).toBe('CONFLICT');
  });

  it('5xx and anything unrecognized is PERMANENT', () => {
    expect(classifyError(err({ status: 500 }))).toBe('PERMANENT');
    expect(classifyError(undefined)).toBe('PERMANENT');
    expect(classifyError(new Error('unexpected'))).toBe('PERMANENT');
  });
});

describe('conflictReasonFor', () => {
  it('maps the backend codes added for offline conflicts', () => {
    expect(conflictReasonFor(err({ code: 'INSUFFICIENT_STOCK' }))).toBe('INSUFFICIENT_STOCK');
    expect(conflictReasonFor(err({ code: 'STALE_VERSION' }))).toBe('STALE_VERSION');
  });

  it('falls back to NOT_FOUND for a 404 with no specific code', () => {
    expect(conflictReasonFor(err({ status: 404 }))).toBe('NOT_FOUND');
  });

  it('falls back to VALIDATION_ERROR for an ordinary business-rule 400', () => {
    expect(conflictReasonFor(err({ status: 400 }))).toBe('VALIDATION_ERROR');
  });
});

describe('friendlyMessage — section 38, never a raw technical error', () => {
  it('never surfaces stack-trace-shaped text for a network failure', () => {
    const msg = friendlyMessage(err({ isNetworkError: true }), 'sale');
    expect(msg).not.toMatch(/Error|ECONNRESET|Axios|Prisma/i);
    expect(msg.toLowerCase()).toContain('saved');
  });

  it('passes through the backend\'s own message for a conflict, since those are already human-written', () => {
    const msg = friendlyMessage(err({ status: 400, message: 'Insufficient stock for product prod_1' }), 'sale');
    expect(msg).toBe('Insufficient stock for product prod_1');
  });
});
