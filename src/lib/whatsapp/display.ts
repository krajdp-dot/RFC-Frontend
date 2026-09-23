import type { WhatsAppMessageStatus } from './types';

/** Section 41's mockup: "✓ Delivered / ✓ Read / ! Failed" — small, consistent status copy wherever a message status is shown. */
export function statusLabel(status: WhatsAppMessageStatus): string {
  switch (status) {
    case 'QUEUED':
      return 'Waiting to send';
    case 'SENDING':
      return 'Sending';
    case 'SENT':
      return 'Sent';
    case 'DELIVERED':
      return 'Delivered';
    case 'READ':
      return 'Read';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function statusTone(status: WhatsAppMessageStatus): 'neutral' | 'positive' | 'negative' {
  if (status === 'DELIVERED' || status === 'READ' || status === 'SENT') return 'positive';
  if (status === 'FAILED') return 'negative';
  return 'neutral';
}

const TEMPLATE_LABELS: Record<string, string> = {
  sale_confirmation: 'Sale confirmation',
  payment_receipt: 'Payment receipt',
  outstanding_reminder: 'Outstanding reminder',
  statement: 'Statement',
  price_board: 'Price update',
};

export function messageLabel(templateName: string | null): string {
  if (!templateName) return 'Message';
  return TEMPLATE_LABELS[templateName] ?? templateName;
}
