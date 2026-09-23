import { fetchApi } from '../fetchApi';
import type { WhatsAppMessage, WhatsAppAutomationSettings } from './types';

/**
 * Phase 12 — the one file that knows the WhatsApp API's URL shapes. Every
 * component calls through here rather than fetchApi directly, matching
 * the same "one seam" principle the backend's provider abstraction uses
 * (section 3) — if a URL or a response shape changes, this is the only
 * file that needs to know.
 */

export function sendSaleConfirmation(saleId: string): Promise<WhatsAppMessage> {
  return fetchApi(`/whatsapp/sales/${saleId}/confirmation`, { method: 'POST' });
}

export function sendPaymentReceipt(paymentId: string): Promise<WhatsAppMessage> {
  return fetchApi(`/whatsapp/payments/${paymentId}/receipt`, { method: 'POST' });
}

export function sendOutstandingReminder(customerId: string): Promise<WhatsAppMessage> {
  return fetchApi(`/whatsapp/customers/${customerId}/outstanding-reminder`, { method: 'POST' });
}

export function sendStatement(customerId: string, mutationId?: string): Promise<WhatsAppMessage> {
  return fetchApi(`/whatsapp/customers/${customerId}/statement`, {
    method: 'POST',
    body: JSON.stringify(mutationId ? { mutationId } : {}),
  });
}

export function sendCustomMessage(customerId: string, content: string, mutationId: string): Promise<WhatsAppMessage> {
  return fetchApi(`/whatsapp/customers/${customerId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, mutationId }),
  });
}

export function setOptIn(customerId: string, optIn: boolean) {
  return fetchApi(`/whatsapp/customers/${customerId}/opt-in`, {
    method: 'PUT',
    body: JSON.stringify({ optIn }),
  });
}

export async function listMessages(params: {
  customerId?: string;
  status?: string;
  messageType?: string;
  page?: number;
}): Promise<{ data: WhatsAppMessage[]; meta: { total: number; page: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.customerId) query.set('customerId', params.customerId);
  if (params.status) query.set('status', params.status);
  if (params.messageType) query.set('messageType', params.messageType);
  if (params.page) query.set('page', String(params.page));
  return fetchApi(`/whatsapp/messages?${query.toString()}`);
}

export function getAutomationSettings(): Promise<WhatsAppAutomationSettings> {
  return fetchApi('/whatsapp/settings/automation');
}

export function updateAutomationSettings(
  changes: Partial<WhatsAppAutomationSettings>,
): Promise<WhatsAppAutomationSettings> {
  return fetchApi('/whatsapp/settings/automation', { method: 'PUT', body: JSON.stringify(changes) });
}
