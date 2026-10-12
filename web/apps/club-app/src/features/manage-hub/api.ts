import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { ToDoMarkSurface } from '@/features/to-dos';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type { InvitationRoundKind } from './invitation-round-labels';
import { toRoundSentMessage } from './invitation-round-labels';
import { withManageToDoMark } from './manage-to-dos';
import {
  requestBulkInvitation,
  requestInvitationReminders,
  requestInvitationRoundPreview,
  requestManageHub,
} from './requests';
import type { InvitationRoundPreview, InvitationRoundSent, ManageHub } from './schemas';

export const useManageHubQuery = (): UseQueryResult<ManageHub, Error> =>
  useQuery({
    queryKey: queryKeys.manageHub,
    queryFn: () => withFreshAccessToken(requestManageHub),
  });

export const useInvitationRoundPreviewQuery = (): UseQueryResult<InvitationRoundPreview, Error> =>
  useQuery({
    queryKey: queryKeys.invitationRoundPreview,
    queryFn: () => withFreshAccessToken(requestInvitationRoundPreview),
  });

const ROUND_REQUESTS: Record<
  InvitationRoundKind,
  (accessToken: string) => Promise<InvitationRoundSent>
> = {
  invite: requestBulkInvitation,
  remind: requestInvitationReminders,
};

export const useInvitationRoundMutation = (
  kind: InvitationRoundKind,
): UseMutationResult<InvitationRoundSent, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => ROUND_REQUESTS[kind](accessToken),
    changes: ['account'],
    notice: { success: (_input, sent) => toRoundSentMessage(kind, sent.sentCount) },
  });

export const MANAGE_TO_DO_SURFACE: ToDoMarkSurface<ManageHub> = {
  queryKey: queryKeys.manageHub,
  withMark: withManageToDoMark,
};
