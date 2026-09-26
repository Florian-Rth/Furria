import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toInvitationSentMessage } from './account-access-labels';
import { requestAccessState, requestInPersonInvitation, requestMailInvitation } from './requests';
import type { AccessState, InPersonInvitation, IssuedInvitation } from './schemas';
import type { AccessSubject } from './types';

const ACCESS_STATE_POLL_MS = 2000;

export const useMailInvitationMutation = (
  subject: AccessSubject,
  onInvited: () => void,
): UseMutationResult<IssuedInvitation, Error, void> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestMailInvitation(subject.personId, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: toInvitationSentMessage(subject.firstName) });
      onInvited();
    },
  });
};

export const useInPersonInvitationMutation = (
  personId: number,
): UseMutationResult<InPersonInvitation, Error, void> =>
  useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestInPersonInvitation(personId, accessToken)),
  });

const accessStateQueryKey = (personId: number): readonly [string, string, number, string] => [
  'manage',
  'persons',
  personId,
  'access-state',
];

export const useAccessStateQuery = (
  personId: number,
  isPolling: boolean,
): UseQueryResult<AccessState, Error> =>
  useQuery({
    queryKey: accessStateQueryKey(personId),
    queryFn: isPolling
      ? (): Promise<AccessState> =>
          withFreshAccessToken((accessToken) => requestAccessState(personId, accessToken))
      : skipToken,
    refetchInterval: (query) =>
      isPolling && query.state.data?.state !== 'active' ? ACCESS_STATE_POLL_MS : false,
    refetchIntervalInBackground: false,
    gcTime: 0,
  });
