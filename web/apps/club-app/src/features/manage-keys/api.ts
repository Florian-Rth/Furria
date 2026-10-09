import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useManagedKeysQuery = (): UseQueryResult<KeyHoldingsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedKeys,
    queryFn: () => withFreshAccessToken(requestKeyHoldings),
  });

export const useHandOutKeyMutation = (): UseMutationResult<
  CreatedKeyHolding,
  Error,
  KeyHandoutInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['keyHolding'] },
    mutationFn: (input: KeyHandoutInput) =>
      withFreshAccessToken((accessToken) =>
        requestKeyHandout(
          { venueId: input.venueId, personId: input.personId, sinceOn: input.sinceOn },
          accessToken,
        ),
      ),
    onSuccess: (_created, input) => {
      raiseNotice({
        tone: 'success',
        message: toKeyHandedOutMessage(
          input.personName,
          input.venueName,
          input.sinceOn,
          toIsoDay(new Date()),
        ),
      });
    },
  });
};

export const useTakeBackKeyMutation = (): UseMutationResult<void, Error, KeyReturnInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['keyHolding'] },
    mutationFn: (input: KeyReturnInput) =>
      withFreshAccessToken((accessToken) =>
        requestKeyReturn(input.keyHoldingId, input.untilOn, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({
        tone: 'success',
        message: toKeyTakenBackMessage(input.personName, input.untilOn, toIsoDay(new Date())),
      });
    },
  });
};
