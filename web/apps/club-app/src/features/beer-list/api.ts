import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import {
  requestBeerCratesBooking,
  requestBeerCratesUndo,
  requestBeerGivers,
  requestBeerListEnrollment,
  requestMyBeerTab,
  requestOpenBeerPot,
} from './requests';
import type { BeerGivers, BeerTab, BookedBeerCrates, OpenBeerPotResponse } from './schemas';

export const useOpenBeerPotQuery = (enabled = true): UseQueryResult<OpenBeerPotResponse, Error> =>
  useQuery({
    queryKey: queryKeys.beerPot,
    queryFn: () => withFreshAccessToken(requestOpenBeerPot),
    enabled,
  });

export const useMyBeerTabQuery = (enabled = true): UseQueryResult<BeerTab, Error> =>
  useQuery({
    queryKey: queryKeys.beerTab,
    queryFn: () => withFreshAccessToken(requestMyBeerTab),
    enabled,
  });

export const useBeerGiversQuery = (enabled = true): UseQueryResult<BeerGivers, Error> =>
  useQuery({
    queryKey: queryKeys.beerGivers,
    queryFn: () => withFreshAccessToken(requestBeerGivers),
    enabled,
  });

export const useBeerCratesBooking = (): UseMutationResult<BookedBeerCrates, Error, number> =>
  useApiMutation({ request: requestBeerCratesBooking, changes: ['beerCrate'] });

export const useBeerCratesUndo = (): UseMutationResult<void, Error, readonly number[]> =>
  useApiMutation({ request: requestBeerCratesUndo, changes: ['beerCrate'] });

export const useBeerListJoin = (): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestBeerListEnrollment(accessToken),
    changes: ['beerListEnrollment'],
  });
