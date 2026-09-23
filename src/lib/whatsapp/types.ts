/**
 * Phase 12 — mirrors the shape whatsapp.service.ts actually returns.
 * Kept intentionally small: this is what the UI renders, not a client
 * model of the whole WhatsApp domain.
 */

export type WhatsAppMessageStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED';

export interface WhatsAppMessage {
  id: string;
  customerId: string | null;
  messageType: string;
  templateName: string | null;
  recipient: string;
  contentSnapshot: string;
  status: WhatsAppMessageStatus;
  failureReason: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface WhatsAppAutomationSettings {
  saleConfirmationEnabled: boolean;
  paymentReceiptEnabled: boolean;
  outstandingReminderEnabled: boolean;
}

/** Section 38's "quick actions" — what the WhatsApp panel offers from a customer's page. */
export type QuickAction = 'statement' | 'outstanding-reminder' | 'custom';
