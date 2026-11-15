import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  BeerDrinkPrice,
  BeerEnrollmentsResponse,
  BeerHandover,
  BeerJournalResponse,
  BeerNewDrink,
  BeerPaymentPick,
  BeerPotSettings,
  BeerPotsResponse,
  BeerStockResponse,
  BeerTabsResponse,
} from './schemas';
import {
  BeerCratesBookedSchema,
  BeerDrinkCreatedSchema,
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

export interface BeerPotOpeningBody {
  ownerPersonId: number;
  paymentLink: string | null;
  drinks: readonly BeerNewDrink[];
}

export const requestBeerPotOpening = (
  body: BeerPotOpeningBody,
  accessToken: string,
): Promise<number> =>
  apiFetch(POTS, {
    method: 'POST',
    body: {
      ownerPersonId: body.ownerPersonId,
      paymentLink: body.paymentLink,
      drinks: body.drinks.map((drink) => ({
        name: drink.name,
        cratePriceCents: drink.cratePriceCents,
      })),
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
    body: { paymentLink: settings.paymentLink },
    schema: NoContentSchema,
    accessToken,
  });

export interface BeerStockBody {
  beerDrinkId: number;
  crates: number;
}

export const requestBeerDelivery = (
  beerPotId: number,
  body: BeerStockBody,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/deliveries`, {
    method: 'POST',
    body: { beerDrinkId: body.beerDrinkId, crates: body.crates },
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerStockCorrection = (
  beerPotId: number,
  body: BeerStockBody,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/stock-corrections`, {
    method: 'POST',
    body: { beerDrinkId: body.beerDrinkId, crates: body.crates },
    schema: NoContentSchema,
    accessToken,
  });

export interface BeerCratesForBody {
  personId: number;
  beerDrinkId: number;
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
    body: {
      personId: body.personId,
      beerDrinkId: body.beerDrinkId,
      count: body.count,
      paid: body.paid,
    },
    schema: BeerCratesBookedSchema,
    accessToken,
  }).then(() => undefined);

export const requestBeerCrateUndo = (beerCrateId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/beer-list/crates/${beerCrateId}/undo`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export interface BeerPaymentBody {
  personId: number;
  drinks: readonly BeerPaymentPick[];
}

export const requestBeerPayment = (
  beerPotId: number,
  body: BeerPaymentBody,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/payments`, {
    method: 'POST',
    body: {
      personId: body.personId,
      drinks: body.drinks.map((drink) => ({
        beerDrinkId: drink.beerDrinkId,
        crates: drink.crates,
      })),
    },
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

export interface BeerHandoverBody {
  successorPersonId: number;
  paymentLink: string | null;
  drinks: readonly BeerDrinkPrice[];
}

export const requestBeerPotHandover = (
  beerPotId: number,
  body: BeerHandoverBody,
  accessToken: string,
): Promise<BeerHandover> =>
  apiFetch(`${POTS}/${beerPotId}/handover`, {
    method: 'POST',
    body: {
      successorPersonId: body.successorPersonId,
      paymentLink: body.paymentLink,
      drinks: body.drinks.map((drink) => ({
        beerDrinkId: drink.beerDrinkId,
        cratePriceCents: drink.cratePriceCents,
      })),
    },
    schema: BeerHandoverSchema,
    accessToken,
  });

export const requestBeerDrinkAddition = (
  beerPotId: number,
  drink: BeerNewDrink,
  accessToken: string,
): Promise<number> =>
  apiFetch(`${POTS}/${beerPotId}/drinks`, {
    method: 'POST',
    body: { name: drink.name, cratePriceCents: drink.cratePriceCents },
    schema: BeerDrinkCreatedSchema,
    accessToken,
  }).then((created) => created.beerDrinkId);

export const requestBeerDrinkChange = (
  beerPotId: number,
  beerDrinkId: number,
  drink: BeerNewDrink,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/drinks/${beerDrinkId}`, {
    method: 'PUT',
    body: { name: drink.name, cratePriceCents: drink.cratePriceCents },
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerDrinkRetirement = (
  beerPotId: number,
  beerDrinkId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/drinks/${beerDrinkId}/retire`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestBeerDrinkDefault = (
  beerPotId: number,
  beerDrinkId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POTS}/${beerPotId}/drinks/${beerDrinkId}/default`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });
