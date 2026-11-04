import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { BeerStockChange } from './beer-hub';
import {
  cratesNoticeOf,
  ENDED_NOTICE,
  handoverNoticeOf,
  OPENED_NOTICE,
  PAYMENT_UNDONE_NOTICE,
  paymentNoticeOf,
  SETTINGS_NOTICE,
  stockNoticeOf,
  UNDONE_CRATE_NOTICE,
} from './beer-hub-copy';
import type { BeerCratesForBody } from './requests';
import {
  requestBeerCratesFor,
  requestBeerCrateUndo,
  requestBeerDelivery,
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
  requestOpenBeerPot,
} from './requests';
import type {
  BeerEnrollmentsResponse,
  BeerHandover,
  BeerJournalResponse,
  BeerPotSettings,
  BeerPotsResponse,
  BeerStockResponse,
  BeerTabsResponse,
  OpenBeerPotResponse,
} from './schemas';

const FAILURE = { failure: toWriteErrorMessage };

export const useOpenBeerPotQuery = (): UseQueryResult<OpenBeerPotResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerPot,
    queryFn: () => withFreshAccessToken(requestOpenBeerPot),
  });

export const useBeerPotsQuery = (): UseQueryResult<BeerPotsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerPots,
    queryFn: () => withFreshAccessToken(requestBeerPots),
  });

export const useBeerEnrollmentsQuery = (): UseQueryResult<BeerEnrollmentsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerEnrollments,
    queryFn: () => withFreshAccessToken(requestBeerEnrollments),
  });

export const useBeerStockQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerStockResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerStock(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerStock(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
  });

export const useBeerTabsQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerTabsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerTabs(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerTabs(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
  });

export const useBeerJournalQuery = (
  beerPotId: number | null,
): UseQueryResult<BeerJournalResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerJournal(beerPotId ?? 0),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestBeerJournal(beerPotId ?? 0, accessToken)),
    enabled: beerPotId !== null,
  });

export interface BeerPotOpeningInput {
  ownerPersonId: number;
  settings: BeerPotSettings;
}

export const useOpenBeerPotMutation = (): UseMutationResult<number, Error, BeerPotOpeningInput> =>
  useApiMutation({
    request: (input: BeerPotOpeningInput, accessToken) =>
      requestBeerPotOpening(input.ownerPersonId, input.settings, accessToken),
    changes: ['beerPot'],
    notice: { success: () => OPENED_NOTICE, ...FAILURE },
  });

export const useBeerPotSettingsMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerPotSettings> =>
  useApiMutation({
    request: (settings: BeerPotSettings, accessToken) =>
      requestBeerPotSettings(beerPotId, settings, accessToken),
    changes: ['beerPot'],
    notice: { success: () => SETTINGS_NOTICE, ...FAILURE },
  });

export const useBeerStockMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerStockChange> =>
  useApiMutation({
    request: (change: BeerStockChange, accessToken) =>
      change.kind === 'delivery'
        ? requestBeerDelivery(beerPotId, change.crates, accessToken)
        : requestBeerStockCorrection(beerPotId, change.crates, change.reason, accessToken),
    changes: ['beerStock'],
    notice: { success: stockNoticeOf, ...FAILURE },
  });

export interface BeerCratesForInput extends BeerCratesForBody {
  name: string;
}

export const useBeerCratesForMutation = (
  beerPotId: number,
): UseMutationResult<void, Error, BeerCratesForInput> =>
  useApiMutation({
    request: (input: BeerCratesForInput, accessToken) =>
      requestBeerCratesFor(
        beerPotId,
        { personId: input.personId, count: input.count, paid: input.paid },
        accessToken,
      ),
    changes: ['beerCrate', 'beerPayment'],
    notice: { success: cratesNoticeOf, ...FAILURE },
  });

export const useBeerCrateUndoMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestBeerCrateUndo,
    changes: ['beerCrate'],
    notice: { success: () => UNDONE_CRATE_NOTICE, ...FAILURE },
  });

export interface BeerPaymentInput {
  beerPotId: number;
  personId: number;
  crates: number;
  name: string;
}

export const useBeerPaymentMutation = (): UseMutationResult<void, Error, BeerPaymentInput> =>
  useApiMutation({
    request: (input: BeerPaymentInput, accessToken) =>
      requestBeerPayment(input.beerPotId, input.personId, input.crates, accessToken),
    changes: ['beerPayment'],
    notice: { success: paymentNoticeOf, ...FAILURE },
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

export interface BeerHandoverInput {
  beerPotId: number;
  successorPersonId: number;
  settings: BeerPotSettings;
}

export const useBeerHandoverMutation = (): UseMutationResult<
  BeerHandover,
  Error,
  BeerHandoverInput
> =>
  useApiMutation({
    request: (input: BeerHandoverInput, accessToken) =>
      requestBeerPotHandover(input.beerPotId, input.successorPersonId, input.settings, accessToken),
    changes: ['beerPot', 'beerStock'],
    notice: { success: (_input, result) => handoverNoticeOf(result.carriedCrates), ...FAILURE },
  });
