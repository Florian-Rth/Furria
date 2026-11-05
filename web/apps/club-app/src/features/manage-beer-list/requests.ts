import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  BeerEnrollmentsResponse,
  BeerHandover,
  BeerJournalResponse,
  BeerPotSettings,
  BeerPotsResponse,
  BeerStockResponse,
  BeerTabsResponse,
} from './schemas';
import {
  BeerCratesBookedSchema,
  BeerEnrollmentsResponseSchema,
  BeerHandoverSchema,
  BeerJournalResponseSchema,
  BeerPaymentBookedSchema,
  BeerPotCreatedSchema,
  BeerPotsResponseSchema,
  BeerStockResponseSchema,
  BeerTabsResponseSchema,
} from './schemas';

const POTS = '/api/beer-list/pots';

export const requestBeerPots = (accessToken: string): Promise<BeerPotsResponse> =>
  apiFetch(POTS, { schema: BeerPotsResponseSchema, accessToken });

export const requestBeerEnrollments = (accessToken: string): Promise<BeerEnrollmentsResponse> =>
  apiFetch('/api/beer-list/enrollments', { schema: BeerEnrollmentsResponseSchema, accessToken });

export const requestBeerStock = (
  beerPotId: number,
  accessToken: string,
): Promise<BeerStockResponse> =>
  apiFetch(`${POTS}/${beerPotId}/stock`, { schema: BeerStockResponseSchema, accessToken });

export const requestBeerTabs = (
  beerPotId: number,
  accessToken: string,
): Promise<BeerTabsResponse> =>
  apiFetch(`${POTS}/${beerPotId}/tabs`, { schema: BeerTabsResponseSchema, accessToken });

export const requestBeerJournal = (
  beerPotId: number,
  accessToken: string,
): Promise<BeerJournalResponse> =>
  apiFetch(`${POTS}/${beerPotId}/journal`, { schema: BeerJournalResponseSchema, accessToken });

export const requestBeerPotOpening = (
  ownerPersonId: number,
  settings: BeerPotSettings,
  accessToken: string,
): Promise<number> =>
  apiFetch(POTS, {
    method: 'POST',
    body: {
      ownerPersonId,
      cratePriceCents: settings.cratePriceCents,
      paymentLink: settings.paymentLink,
    },
    schema: BeerPotCreatedSchema,
    accessToken,
  }).then((created) => created.beerPotId);

export const requestBeerPotSettings = (
  beerPotId: number,
  settings: BeerPotSettings,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}`, {
    method: 'PUT',
    body: {
      cratePriceCents: settings.cratePriceCents,
      paymentLink: settings.paymentLink,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerDelivery = (
  beerPotId: number,
  crates: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/deliveries`, {
    method: 'POST',
    body: { crates },
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerStockCorrection = (
  beerPotId: number,
  crates: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/stock-corrections`, {
    method: 'POST',
    body: { crates },
    schema: NoContentSchema,
    accessToken,
  });

export interface BeerCratesForBody {
  personId: number;
  count: number;
  paid: boolean;
}

export const requestBeerCratesFor = (
  beerPotId: number,
  body: BeerCratesForBody,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/crates`, {
    method: 'POST',
    body: { personId: body.personId, count: body.count, paid: body.paid },
    schema: BeerCratesBookedSchema,
    accessToken,
  }).then(() => undefined);

export const requestBeerCrateUndo = (beerCrateId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/beer-list/crates/${beerCrateId}/undo`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerPayment = (
  beerPotId: number,
  personId: number,
  crates: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/payments`, {
    method: 'POST',
    body: { personId, crates },
    schema: BeerPaymentBookedSchema,
    accessToken,
  }).then(() => undefined);

export const requestBeerPaymentUndo = (beerPaymentId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/beer-list/payments/${beerPaymentId}/undo`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerEnrollmentEnd = (
  enrollmentId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/beer-list/enrollments/${enrollmentId}/end`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerPotHandover = (
  beerPotId: number,
  successorPersonId: number,
  settings: BeerPotSettings,
  accessToken: string,
): Promise<BeerHandover> =>
  apiFetch(`${POTS}/${beerPotId}/handover`, {
    method: 'POST',
    body: {
      successorPersonId,
      cratePriceCents: settings.cratePriceCents,
      paymentLink: settings.paymentLink,
    },
    schema: BeerHandoverSchema,
    accessToken,
  });
