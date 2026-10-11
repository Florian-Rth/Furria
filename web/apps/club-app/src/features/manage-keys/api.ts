import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { toKeyHandedOutMessage, toKeyTakenBackMessage } from './manage-keys-labels';
import { requestKeyHandout, requestKeyHoldings, requestKeyReturn } from './requests';
import type { CreatedKeyHolding, KeyHoldingsResponse } from './schemas';

export const MANAGED_KEYS_QUERY_KEY = ['manage', 'keys'] as const;

export interface KeyHandoutInput {
  venueId: number;
  venueName: string;
  personId: number;
  personName: string;
  sinceOn: string;
}

export interface KeyReturnInput {
  keyHoldingId: number;
  personName: string;
  untilOn: string;
}

const KEYS_SCOPE = [MANAGED_KEYS_QUERY_KEY, MANAGE_HUB_QUERY_KEY, CLUB_HUB_QUERY_KEY] as const;

export const useManagedKeysQuery = (): UseQueryResult<KeyHoldingsResponse, Error> =>
  useQuery({
    queryKey: MANAGED_KEYS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestKeyHoldings),
  });

export const useHandOutKeyMutation = (): UseMutationResult<
  CreatedKeyHolding,
  Error,
  KeyHandoutInput
> =>
  useApiMutation({
    request: (input: KeyHandoutInput, accessToken) =>
      requestKeyHandout(
        { venueId: input.venueId, personId: input.personId, sinceOn: input.sinceOn },
        accessToken,
      ),
    invalidates: KEYS_SCOPE,
    notice: {
      success: (input) =>
        toKeyHandedOutMessage(
          input.personName,
          input.venueName,
          input.sinceOn,
          toIsoDay(new Date()),
        ),
    },
  });

export const useTakeBackKeyMutation = (): UseMutationResult<void, Error, KeyReturnInput> =>
  useApiMutation({
    request: (input: KeyReturnInput, accessToken) =>
      requestKeyReturn(input.keyHoldingId, input.untilOn, accessToken),
    invalidates: KEYS_SCOPE,
    notice: {
      success: (input) =>
        toKeyTakenBackMessage(input.personName, input.untilOn, toIsoDay(new Date())),
    },
  });
