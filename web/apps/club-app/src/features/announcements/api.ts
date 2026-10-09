import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import {
  ANNOUNCEMENT_CHANGED_MESSAGE,
  ANNOUNCEMENT_POSTED_MESSAGE,
  ANNOUNCEMENT_WITHDRAWN_MESSAGE,
} from './announcements-labels';
import { toNextLastSeenAt } from './last-seen';
import {
  requestAnnouncements,
  requestCreateAnnouncement,
  requestLastSeenAnnouncement,
  requestUpdateAnnouncement,
  requestWithdrawAnnouncement,
} from './requests';
import type { AnnouncementForm, AnnouncementsResponse, CreatedAnnouncement } from './schemas';

interface LastSeenRollback {
  previous: Me | undefined;
}

export interface LastSeenInput {
  seenUpTo: string | null;
}

const applyLastSeen = (
  current: Me | undefined,
  seenUpTo: string | null,
  now: Date,
): Me | undefined =>
  current === undefined
    ? undefined
    : {
        ...current,
        lastSeenAnnouncementAt: toNextLastSeenAt(current.lastSeenAnnouncementAt, seenUpTo, now),
      };

export const useAnnouncementsQuery = (): UseQueryResult<AnnouncementsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.announcements,
    queryFn: () => withFreshAccessToken(requestAnnouncements),
  });

export const useCreateAnnouncementMutation = (): UseMutationResult<
  CreatedAnnouncement,
  Error,
  AnnouncementForm
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['announcement'] },
    mutationFn: (form: AnnouncementForm) =>
      withFreshAccessToken((accessToken) => requestCreateAnnouncement(form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_POSTED_MESSAGE });
    },
  });
};

export const useUpdateAnnouncementMutation = (
  announcementId: number,
): UseMutationResult<void, Error, AnnouncementForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['announcement'] },
    mutationFn: (form: AnnouncementForm) =>
      withFreshAccessToken((accessToken) =>
        requestUpdateAnnouncement(announcementId, form, accessToken),
      ),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_CHANGED_MESSAGE });
    },
  });
};

export const useWithdrawAnnouncementMutation = (): UseMutationResult<void, Error, number> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['announcement'] },
    mutationFn: (announcementId: number) =>
      withFreshAccessToken((accessToken) =>
        requestWithdrawAnnouncement(announcementId, accessToken),
      ),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_WITHDRAWN_MESSAGE });
    },
  });
};

export const useLastSeenAnnouncementMutation = (): UseMutationResult<
  void,
  Error,
  LastSeenInput,
  LastSeenRollback
> => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { changes: ['announcementSeen'] },
    mutationFn: ({ seenUpTo }: LastSeenInput) =>
      withFreshAccessToken((accessToken) => requestLastSeenAnnouncement(seenUpTo, accessToken)),
    onMutate: async ({ seenUpTo }: LastSeenInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });
      const previous = queryClient.getQueryData<Me>(queryKeys.me);
      const now = new Date();

      queryClient.setQueryData<Me>(queryKeys.me, (current) =>
        applyLastSeen(current, seenUpTo, now),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKeys.me, context?.previous);
    },
  });
};
