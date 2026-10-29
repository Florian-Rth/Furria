import { apiStatusOf } from '@furria/api-client';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import type {
  ActForm,
  ActsResponse,
  CreatedAct,
  RunningOrderBody,
  RunningOrderResponse,
  RunningOrdersResponse,
  Suggestion,
} from './schemas';
import {
  ActsResponseSchema,
  CreatedActSchema,
  RunningOrderResponseSchema,
  RunningOrdersResponseSchema,
  SuggestionSchema,
} from './schemas';

const CONFLICT_STATUS = 409;

export class RunningOrderConflictError extends Error {
  constructor() {
    super('The running order changed meanwhile.');
    this.name = 'RunningOrderConflictError';
  }
}

export const isRunningOrderConflict = (error: Error | null): boolean =>
  error instanceof RunningOrderConflictError;

const runningOrderPathOf = (eventId: number): string => `/api/events/${eventId}/running-order`;

const actsPathOf = (sessionYear: number | null): string =>
  sessionYear === null ? '/api/acts' : `/api/acts?session=${sessionYear}`;

export const requestActs = (
  sessionYear: number | null,
  accessToken: string,
): Promise<ActsResponse> =>
  apiFetch(actsPathOf(sessionYear), { schema: ActsResponseSchema, accessToken });

export const requestActCreation = (form: ActForm, accessToken: string): Promise<CreatedAct> =>
  apiFetch('/api/acts', { method: 'POST', body: form, schema: CreatedActSchema, accessToken });

export const requestActUpdate = (
  actId: number,
  form: ActForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/acts/${actId}`, {
    method: 'PUT',
    body: form,
    schema: NoContentSchema,
    accessToken,
  });

export const requestActArchived = (
  actId: number,
  archived: boolean,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/acts/${actId}/archived`, {
    method: 'PUT',
    body: { archived },
    schema: NoContentSchema,
    accessToken,
  });

export const requestRunningOrder = async (
  eventId: number,
  accessToken: string,
): Promise<RunningOrderResponse | null> => {
  try {
    return await apiFetch(runningOrderPathOf(eventId), {
      schema: RunningOrderResponseSchema,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error && isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
};

export const requestRunningOrderSave = async (
  eventId: number,
  body: RunningOrderBody,
  accessToken: string,
): Promise<RunningOrderResponse> => {
  try {
    return await apiFetch(runningOrderPathOf(eventId), {
      method: 'PUT',
      body,
      schema: RunningOrderResponseSchema,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error && apiStatusOf(error) === CONFLICT_STATUS) {
      throw new RunningOrderConflictError();
    }
    throw error;
  }
};

export const requestRunningOrderDeletion = (eventId: number, accessToken: string): Promise<void> =>
  apiFetch(runningOrderPathOf(eventId), {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSuggestion = (
  eventId: number,
  body: RunningOrderBody,
  accessToken: string,
): Promise<Suggestion> =>
  apiFetch(`${runningOrderPathOf(eventId)}/suggestion`, {
    method: 'POST',
    body,
    schema: SuggestionSchema,
    accessToken,
  });

export const requestRunningOrderConfirmation = (
  eventId: number,
  confirmed: boolean,
  accessToken: string,
): Promise<RunningOrderResponse> =>
  apiFetch(`${runningOrderPathOf(eventId)}/confirmation`, {
    method: 'PUT',
    body: { confirmed },
    schema: RunningOrderResponseSchema,
    accessToken,
  });

export const requestRunningOrders = (accessToken: string): Promise<RunningOrdersResponse> =>
  apiFetch('/api/running-orders', { schema: RunningOrdersResponseSchema, accessToken });
