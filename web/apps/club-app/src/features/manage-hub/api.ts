import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PERSONS_QUERY_KEY } from '@/features/manage-persons';
import { START_QUERY_KEY } from '@/features/start';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { InvitationRoundKind } from './invitation-round-labels';
import { toRoundSentMessage } from './invitation-round-labels';
import { toToDoMarkErrorMessage } from './manage-hub-messages';
import type { ToDoMark } from './manage-to-dos';
import { withToDoMark } from './manage-to-dos';
import {
  requestBulkInvitation,
  requestInvitationReminders,
  requestInvitationRoundPreview,
  requestManageHub,
  requestToDoSeen,
  requestToDoUnseen,
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
): UseMutationResult<InvitationRoundSent, Error, void> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () => withFreshAccessToken(ROUND_REQUESTS[kind]),
    onSuccess: (sent) => {
      raiseNotice({ tone: 'success', message: toRoundSentMessage(kind, sent.sentCount) });
      void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: INVITATION_ROUND_PREVIEW_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PERSONS_QUERY_KEY });
    },
  });
};

interface ToDoMarkRollback {
  previous: ManageHub | undefined;
}

const requestToDoMark = (mark: ToDoMark, accessToken: string): Promise<void> =>
  mark.seen
    ? requestToDoSeen(mark.kind, mark.version, accessToken)
    : requestToDoUnseen(mark.kind, accessToken);

export const useToDoMarkMutation = (): UseMutationResult<
  void,
  Error,
  ToDoMark,
  ToDoMarkRollback
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (mark: ToDoMark) =>
      withFreshAccessToken((accessToken) => requestToDoMark(mark, accessToken)),
    onMutate: async (mark) => {
      await queryClient.cancelQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
      const previous = queryClient.getQueryData<ManageHub>(MANAGE_HUB_QUERY_KEY);
      queryClient.setQueryData<ManageHub>(MANAGE_HUB_QUERY_KEY, (current) =>
        withToDoMark(current, mark),
      );

      return { previous };
    },
    onError: (error, _mark, context) => {
      queryClient.setQueryData(MANAGE_HUB_QUERY_KEY, context?.previous);
      const message = toToDoMarkErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: START_QUERY_KEY });
    },
  });
};
