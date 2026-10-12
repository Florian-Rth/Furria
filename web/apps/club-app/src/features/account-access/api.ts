import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
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
): UseMutationResult<IssuedInvitation, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestMailInvitation(subject.personId, accessToken),
    changes: ['account'],
    notice: { success: () => toInvitationSentMessage(subject.firstName) },
  });

export const useInPersonInvitationMutation = (
  purpose: InPersonPurpose,
  personId: number,
): UseMutationResult<InPersonInvitation, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestInPersonInvitation(purpose, personId, accessToken),
    changes: ['account'],
  });

export const useAccountLockMutation = (
  subject: AccessSubject,
  act: AccountLockAct,
): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: async (_input, accessToken) => {
      await requestAccountDisabled(subject.personId, act === 'disable', accessToken);
    },
    changes: ['account'],
    notice: { success: () => ACCOUNT_LOCK_COPY[act].done(subject.firstName) },
  });

export const useAccessStateQuery = (
  purpose: InPersonPurpose,
  personId: number,
  isPolling: boolean,
): UseQueryResult<AccessState, Error> =>
  useQuery({
    queryKey: queryKeys.accessState(personId),
    queryFn: isPolling
      ? (): Promise<AccessState> =>
          withFreshAccessToken((accessToken) => requestAccessState(personId, accessToken))
      : skipToken,
    refetchInterval: (query) =>
      isPolling && !isHandedOver(purpose, query.state.data) ? ACCESS_STATE_POLL_MS : false,
    refetchIntervalInBackground: false,
    gcTime: 0,
  });
