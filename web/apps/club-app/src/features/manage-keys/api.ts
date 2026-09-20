import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
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

const refreshKeys = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: MANAGED_KEYS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

export const useManagedKeysQuery = (): UseQueryResult<KeyHoldingsResponse, Error> =>
  useQuery({
    queryKey: MANAGED_KEYS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestKeyHoldings),
  });

export const useHandOutKeyMutation = (): UseMutationResult<
  CreatedKeyHolding,
  Error,
  KeyHandoutInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshKeys(queryClient);
    },
  });
};

export const useTakeBackKeyMutation = (): UseMutationResult<void, Error, KeyReturnInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: KeyReturnInput) =>
      withFreshAccessToken((accessToken) =>
        requestKeyReturn(input.keyHoldingId, input.untilOn, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({
        tone: 'success',
        message: toKeyTakenBackMessage(input.personName, input.untilOn, toIsoDay(new Date())),
      });
      refreshKeys(queryClient);
    },
  });
};
