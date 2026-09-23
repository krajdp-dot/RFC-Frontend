import { fetchApi } from '../fetchApi';
import { classifyError } from './errorMapping';
import { capabilityFor } from './capabilityMatrix';
import { enqueueMutation } from './mutationQueue';
import type { OfflineMutation, OfflineOperation } from './types';

export interface SubmitInput<TPayload> {
  operation: OfflineOperation;
  endpoint: string;
  payload: TPayload;
  /** The stable id generated once per form session — reused as-is, never regenerated on retry (section 8). */
  mutationId: string;
  businessId: string;
  userId: string;
  entityLabel: string;
  summary: string;
}

export type SubmitResult<TPayload> =
  | { mode: 'live'; data: any }
  | { mode: 'queued'; mutation: OfflineMutation<TPayload> };

/**
 * Phase 11 — the one function sales/new and receive-payment call instead
 * of fetchApi directly for their final submit. Everything else about
 * those pages (validation, the form itself) is unchanged; this only
 * changes what happens when the POST can't reach the server.
 *
 * A non-network failure (validation, permission, stock conflict on an
 * online attempt) rethrows exactly as fetchApi would have — the calling
 * page's existing error handling doesn't need to know this function
 * exists for that path at all.
 */
export async function submitWithOfflineFallback<TPayload>(
  input: SubmitInput<TPayload>,
): Promise<SubmitResult<TPayload>> {
  try {
    const data = await fetchApi(input.endpoint, {
      method: 'POST',
      body: JSON.stringify(input.payload),
    });
    return { mode: 'live', data };
  } catch (err) {
    const isNetwork = classifyError(err) === 'NETWORK';
    const { offline: approvedOffline } = capabilityFor(input.operation);

    if (!isNetwork || !approvedOffline) throw err;

    const mutation = await enqueueMutation<TPayload>({
      mutationId: input.mutationId,
      businessId: input.businessId,
      userId: input.userId,
      operation: input.operation,
      entityLabel: input.entityLabel,
      summary: input.summary,
      endpoint: input.endpoint,
      payload: input.payload,
    });
    return { mode: 'queued', mutation };
  }
}
