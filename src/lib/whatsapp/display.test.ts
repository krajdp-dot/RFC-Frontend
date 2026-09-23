import { describe, it, expect } from 'vitest';
import { statusLabel, statusTone, messageLabel } from './display';

describe('statusLabel', () => {
  it('gives a plain-language label for every status the backend can send', () => {
    expect(statusLabel('QUEUED')).toBe('Waiting to send');
    expect(statusLabel('SENDING')).toBe('Sending');
    expect(statusLabel('SENT')).toBe('Sent');
    expect(statusLabel('DELIVERED')).toBe('Delivered');
    expect(statusLabel('READ')).toBe('Read');
    expect(statusLabel('FAILED')).toBe('Failed');
    expect(statusLabel('CANCELLED')).toBe('Cancelled');
  });
});

describe('statusTone', () => {
  it('treats SENT/DELIVERED/READ as positive', () => {
    expect(statusTone('SENT')).toBe('positive');
    expect(statusTone('DELIVERED')).toBe('positive');
    expect(statusTone('READ')).toBe('positive');
  });

  it('treats FAILED as negative', () => {
    expect(statusTone('FAILED')).toBe('negative');
  });

  it('treats QUEUED/SENDING/CANCELLED as neutral', () => {
    expect(statusTone('QUEUED')).toBe('neutral');
    expect(statusTone('SENDING')).toBe('neutral');
    expect(statusTone('CANCELLED')).toBe('neutral');
  });
});

describe('messageLabel', () => {
  it('translates every known template name to its display label', () => {
    expect(messageLabel('sale_confirmation')).toBe('Sale confirmation');
    expect(messageLabel('payment_receipt')).toBe('Payment receipt');
    expect(messageLabel('outstanding_reminder')).toBe('Outstanding reminder');
    expect(messageLabel('statement')).toBe('Statement');
    expect(messageLabel('price_board')).toBe('Price update');
  });

  it('falls back to "Message" for a custom (templateless) message', () => {
    expect(messageLabel(null)).toBe('Message');
  });

  it('falls back to the raw name for an unrecognized template rather than hiding it', () => {
    expect(messageLabel('some_new_template')).toBe('some_new_template');
  });
});
