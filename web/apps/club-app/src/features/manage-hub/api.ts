import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { PERSONS_QUERY_KEY } from '@/features/manage-persons';
import { START_QUERY_KEY } from '@/features/start';
import type { ToDoMarkSurface } from '@/features/to-dos';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
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

export const MANAGE_HUB_QUERY_KEY = ['manage-hub'] as const;

export const INVITATION_ROUND_PREVIEW_QUERY_KEY = ['manage', 'invitations', 'preview'] as const;

export const useManageHubQuery = (): UseQueryResult<ManageHub, Error> =>
  useQuery({
    queryKey: MANAGE_HUB_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManageHub),
  });

export const useInvitationRoundPreviewQuery = (): UseQueryResult<InvitationRoundPreview, Error> =>
  useQuery({
    queryKey: INVITATION_ROUND_PREVIEW_QUERY_KEY,
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
    invalidates: [MANAGE_HUB_QUERY_KEY, INVITATION_ROUND_PREVIEW_QUERY_KEY, PERSONS_QUERY_KEY],
    notice: { success: (_input, sent) => toRoundSentMessage(kind, sent.sentCount) },
  });

export const MANAGE_TO_DO_SURFACE: ToDoMarkSurface<ManageHub> = {
  queryKey: MANAGE_HUB_QUERY_KEY,
  withMark: withManageToDoMark,
  alsoRefresh: [START_QUERY_KEY],
};
