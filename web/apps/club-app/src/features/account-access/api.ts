import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { AccountLockAct } from './access-actions';
import { ACCOUNT_LOCK_COPY, toInvitationSentMessage } from './account-access-labels';
import { isHandedOver } from './in-person-phase';
import {
  requestAccessState,
  requestAccountDisabled,
  requestInPersonInvitation,
  requestMailInvitation,
} from './requests';
import type { AccessState, InPersonInvitation, IssuedInvitation } from './schemas';
import type { AccessSubject, InPersonPurpose } from './types';

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
  purpose: InPersonPurpose,
  personId: number,
): UseMutationResult<InPersonInvitation, Error, void> =>
  useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) =>
        requestInPersonInvitation(purpose, personId, accessToken),
      ),
  });

export const useAccountLockMutation = (
  subject: AccessSubject,
  act: AccountLockAct,
  onLocked: () => void,
): UseMutationResult<void, Error, void> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: async () => {
      await withFreshAccessToken((accessToken) =>
        requestAccountDisabled(subject.personId, act === 'disable', accessToken),
      );
    },
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ACCOUNT_LOCK_COPY[act].done(subject.firstName) });
      onLocked();
    },
  });
};

const accessStateQueryKey = (personId: number): readonly [string, string, number, string] => [
  'manage',
  'persons',
  personId,
  'access-state',
];

export const useAccessStateQuery = (
  purpose: InPersonPurpose,
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
      isPolling && !isHandedOver(purpose, query.state.data) ? ACCESS_STATE_POLL_MS : false,
    refetchIntervalInBackground: false,
    gcTime: 0,
  });
