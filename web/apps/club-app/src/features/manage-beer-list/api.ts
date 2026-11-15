import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { LIVE_WHILE_VISIBLE } from '@/features/beer-list/api';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  cratesNoticeOf,
  DRINK_SAVED_NOTICE,
  drinkAddedNoticeOf,
  drinkDefaultNoticeOf,
  drinkRetiredNoticeOf,
  ENDED_NOTICE,
  handoverNoticeOf,
  OPENED_NOTICE,
  PAYMENT_UNDONE_NOTICE,
  paymentNoticeOf,
  SETTINGS_NOTICE,
  stockNoticeOf,
  UNDONE_CRATE_NOTICE,
} from './beer-hub-copy';
import type {
  BeerCratesForBody,
  BeerHandoverBody,
  BeerPaymentBody,
  BeerPotOpeningBody,
} from './requests';
import {
  requestBeerCratesFor,
  requestBeerCrateUndo,
  requestBeerDelivery,
  requestBeerDrinkAddition,
  requestBeerDrinkChange,
  requestBeerDrinkDefault,
  requestBeerDrinkRetirement,
  requestBeerEnrollmentEnd,
  requestBeerEnrollments,
  requestBeerJournal,
  requestBeerPayment,
  requestBeerPaymentUndo,
  requestBeerPotHandover,
  requestBeerPotOpening,
  requestBeerPotSettings,
  requestBeerPots,
  requestBeerStock,
  requestBeerStockCorrection,
  requestBeerTabs,
} from './requests';
import type {
  BeerEnrollmentsResponse,
  BeerHandover,
  BeerJournalResponse,
  BeerNewDrink,
  BeerPotSettings,
  BeerPotsResponse,
  BeerStockChange,
  BeerStockResponse,
  BeerTabsResponse,
} from './schemas';

const FAILURE = { failure: toWriteErrorMessage };

export const useBeerPotsQuery = (): UseQueryResult<BeerPotsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerPots,
    queryFn: () => withFreshAccessToken(requestBeerPots),
    ...LIVE_WHILE_VISIBLE,
  });

export const useBeerEnrollmentsQuery = (
  enabled = true,
): UseQueryResult<BeerEnrollmentsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerEnrollments,
    queryFn: () => withFreshAccessToken(requestBeerEnrollments),
    enabled,
    ...LIVE_WHILE_VISIBLE,
  });

export const useBeerStockQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerStockResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerStock(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerStock(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
    ...LIVE_WHILE_VISIBLE,
  });

export const useBeerTabsQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerTabsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerTabs(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerTabs(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
    ...LIVE_WHILE_VISIBLE,
  });

export const useBeerJournalQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerJournalResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerJournal(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerJournal(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
    ...LIVE_WHILE_VISIBLE,
  });

export const useOpenBeerPotMutation = (): UseMutationResult<number, Error, BeerPotOpeningBody> =>
  useApiMutation({
    request: requestBeerPotOpening,
    changes: ['beerPot'],
    notice: { success: () => OPENED_NOTICE },
  });

export const useBeerPotSettingsMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerPotSettings> =>
  useApiMutation({
    request: (settings: BeerPotSettings, accessToken) =>
      requestBeerPotSettings(beerPotId, settings, accessToken),
    changes: ['beerPot'],
    notice: { success: () => SETTINGS_NOTICE },
  });

export interface BeerStockInput {
  beerDrinkId: number;
  drinkName: string;
  change: BeerStockChange;
}

export const useBeerStockMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerStockInput> =>
  useApiMutation({
    request: (input: BeerStockInput, accessToken) => {
      const body = { beerDrinkId: input.beerDrinkId, crates: input.change.crates };

      return input.change.kind === 'delivery'
        ? requestBeerDelivery(beerPotId, body, accessToken)
        : requestBeerStockCorrection(beerPotId, body, accessToken);
    },
    changes: ['beerStock'],
    notice: { success: stockNoticeOf },
  });

export const useBeerDrinkAddMutation = (
  beerPotId: number,
): UseMutationResult<number, Error, BeerNewDrink> =>
  useApiMutation({
    request: (drink: BeerNewDrink, accessToken) =>
      requestBeerDrinkAddition(beerPotId, drink, accessToken),
    changes: ['beerPot', 'beerStock'],
    notice: { success: (drink) => drinkAddedNoticeOf(drink.name) },
  });

export const useBeerDrinkChangeMutation = (
  beerPotId: number,
  beerDrinkId: number,
): UseMutationResult<void, Error, BeerNewDrink> =>
  useApiMutation({
    request: (drink: BeerNewDrink, accessToken) =>
      requestBeerDrinkChange(beerPotId, beerDrinkId, drink, accessToken),
    changes: ['beerPot', 'beerStock', 'beerCrate'],
    notice: { success: () => DRINK_SAVED_NOTICE },
  });

export interface BeerDrinkInput {
  beerDrinkId: number;
  name: string;
}

export const useBeerDrinkRetireMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerDrinkInput> =>
  useApiMutation({
    request: (input: BeerDrinkInput, accessToken) =>
      requestBeerDrinkRetirement(beerPotId, input.beerDrinkId, accessToken),
    changes: ['beerPot', 'beerStock'],
    notice: { success: (input) => drinkRetiredNoticeOf(input.name), ...FAILURE },
  });

export const useBeerDrinkDefaultMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerDrinkInput> =>
  useApiMutation({
    request: (input: BeerDrinkInput, accessToken) =>
      requestBeerDrinkDefault(beerPotId, input.beerDrinkId, accessToken),
    changes: ['beerPot', 'beerStock'],
    notice: { success: (input) => drinkDefaultNoticeOf(input.name), ...FAILURE },
  });

export interface BeerCratesForInput extends BeerCratesForBody {
  drinkName: string;
  name: string;
}

export const useBeerCratesForMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerCratesForInput> =>
  useApiMutation({
    request: (input: BeerCratesForInput, accessToken) =>
      requestBeerCratesFor(
        beerPotId,
        {
          personId: input.personId,
          beerDrinkId: input.beerDrinkId,
          count: input.count,
          paid: input.paid,
        },
        accessToken,
      ),
    changes: ['beerCrate', 'beerPayment'],
    notice: { success: cratesNoticeOf },
  });

export const useBeerCrateUndoMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestBeerCrateUndo,
    changes: ['beerCrate'],
    notice: { success: () => UNDONE_CRATE_NOTICE, ...FAILURE },
  });

export interface BeerPaymentInput extends BeerPaymentBody {
  beerPotId: number;
  crates: number;
  name: string;
}

export const useBeerPaymentMutation = (): UseMutationResult<void, Error, BeerPaymentInput> =>
  useApiMutation({
    request: (input: BeerPaymentInput, accessToken) =>
      requestBeerPayment(
        input.beerPotId,
        { personId: input.personId, drinks: input.drinks },
        accessToken,
      ),
    changes: ['beerPayment'],
    notice: { success: paymentNoticeOf },
  });

export const useBeerPaymentUndoMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestBeerPaymentUndo,
    changes: ['beerPayment'],
    notice: { success: () => PAYMENT_UNDONE_NOTICE, ...FAILURE },
  });

export const useBeerEnrollmentEndMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestBeerEnrollmentEnd,
    changes: ['beerListEnrollment'],
    notice: { success: () => ENDED_NOTICE, ...FAILURE },
  });

export interface BeerHandoverInput extends BeerHandoverBody {
  beerPotId: number;
}

export const useBeerHandoverMutation = (): UseMutationResult<
  BeerHandover,
  Error,
  BeerHandoverInput
> =>
  useApiMutation({
    request: (input: BeerHandoverInput, accessToken) =>
      requestBeerPotHandover(
        input.beerPotId,
        {
          successorPersonId: input.successorPersonId,
          paymentLink: input.paymentLink,
          drinks: input.drinks,
        },
        accessToken,
      ),
    changes: ['beerPot', 'beerStock'],
    notice: { success: (_input, result) => handoverNoticeOf(result.carriedCrates) },
  });
