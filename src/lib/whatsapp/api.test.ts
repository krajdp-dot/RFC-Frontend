import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../fetchApi', () => ({ fetchApi: vi.fn() }));
import { fetchApi } from '../fetchApi';
import * as whatsapp from './api';

const mockedFetchApi = vi.mocked(fetchApi);

beforeEach(() => {
  mockedFetchApi.mockReset();
  mockedFetchApi.mockResolvedValue({ id: 'msg_1' });
});

describe('whatsapp/api — request shapes', () => {
  it('sendSaleConfirmation POSTs to the sale-scoped endpoint', async () => {
    await whatsapp.sendSaleConfirmation('sale_1');
    expect(mockedFetchApi).toHaveBeenCalledWith('/whatsapp/sales/sale_1/confirmation', { method: 'POST' });
  });

  it('sendPaymentReceipt POSTs to the payment-scoped endpoint', async () => {
    await whatsapp.sendPaymentReceipt('pay_1');
    expect(mockedFetchApi).toHaveBeenCalledWith('/whatsapp/payments/pay_1/receipt', { method: 'POST' });
  });

  it('sendCustomMessage sends content and mutationId in the body', async () => {
    await whatsapp.sendCustomMessage('cust_1', 'Hello there', 'mutation-abc');
    expect(mockedFetchApi).toHaveBeenCalledWith('/whatsapp/customers/cust_1/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello there', mutationId: 'mutation-abc' }),
    });
  });

  it('setOptIn PUTs the boolean', async () => {
    await whatsapp.setOptIn('cust_1', true);
    expect(mockedFetchApi).toHaveBeenCalledWith('/whatsapp/customers/cust_1/opt-in', {
      method: 'PUT',
      body: JSON.stringify({ optIn: true }),
    });
  });

  it('updateAutomationSettings PUTs only the changed keys', async () => {
    await whatsapp.updateAutomationSettings({ saleConfirmationEnabled: true });
    expect(mockedFetchApi).toHaveBeenCalledWith('/whatsapp/settings/automation', {
      method: 'PUT',
      body: JSON.stringify({ saleConfirmationEnabled: true }),
    });
  });

  describe('listMessages — query string construction', () => {
    it('includes only the filters that were actually provided', async () => {
      await whatsapp.listMessages({ customerId: 'cust_1' });
      const [url] = mockedFetchApi.mock.calls[0];
      expect(url).toBe('/whatsapp/messages?customerId=cust_1');
    });

    it('combines every provided filter', async () => {
      await whatsapp.listMessages({ customerId: 'cust_1', status: 'FAILED', messageType: 'TRANSACTIONAL', page: 2 });
      const [url] = mockedFetchApi.mock.calls[0];
      const parsed = new URL(`http://x${url}`);
      expect(parsed.searchParams.get('customerId')).toBe('cust_1');
      expect(parsed.searchParams.get('status')).toBe('FAILED');
      expect(parsed.searchParams.get('messageType')).toBe('TRANSACTIONAL');
      expect(parsed.searchParams.get('page')).toBe('2');
    });

    it('sends no query params at all when nothing is filtered', async () => {
      await whatsapp.listMessages({});
      const [url] = mockedFetchApi.mock.calls[0];
      expect(url).toBe('/whatsapp/messages?');
    });
  });
});
