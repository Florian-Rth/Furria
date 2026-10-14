import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import { toKeyHandedOutMessage, toKeyTakenBackMessage } from './manage-keys-labels';
import { requestKeyHandout, requestKeyHoldings, requestKeyReturn } from './requests';
import type { CreatedKeyHolding, KeyHoldingsResponse } from './schemas';

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

export const useManagedKeysQuery = (enabled = true): UseQueryResult<KeyHoldingsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedKeys,
    queryFn: () => withFreshAccessToken(requestKeyHoldings),
    enabled,
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
    changes: ['keyHolding'],
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
    changes: ['keyHolding'],
    notice: {
      success: (input) =>
        toKeyTakenBackMessage(input.personName, input.untilOn, toIsoDay(new Date())),
    },
  });
