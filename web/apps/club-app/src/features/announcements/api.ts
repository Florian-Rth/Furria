import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { ME_QUERY_KEY } from '@/features/session';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import {
  ANNOUNCEMENT_CHANGED_MESSAGE,
  ANNOUNCEMENT_POSTED_MESSAGE,
  ANNOUNCEMENT_WITHDRAWN_MESSAGE,
} from './announcements-labels';
import {
  requestAnnouncements,
  requestCreateAnnouncement,
  requestLastSeenAnnouncement,
  requestUpdateAnnouncement,
  requestWithdrawAnnouncement,
} from './requests';
import type { AnnouncementForm, AnnouncementsResponse, CreatedAnnouncement } from './schemas';

export const ANNOUNCEMENTS_QUERY_KEY = ['announcements'] as const;

interface LastSeenRollback {
  previous: Me | undefined;
}

const refreshBoard = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

const applyLastSeen = (current: Me | undefined, seenAt: string): Me | undefined =>
  current === undefined ? undefined : { ...current, lastSeenAnnouncementAt: seenAt };

export const useAnnouncementsQuery = (): UseQueryResult<AnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestAnnouncements),
  });

export const useCreateAnnouncementMutation = (): UseMutationResult<
  CreatedAnnouncement,
  Error,
  AnnouncementForm
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: AnnouncementForm) =>
      withFreshAccessToken((accessToken) => requestCreateAnnouncement(form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_POSTED_MESSAGE });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useUpdateAnnouncementMutation = (
  announcementId: number,
): UseMutationResult<void, Error, AnnouncementForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: AnnouncementForm) =>
      withFreshAccessToken((accessToken) =>
        requestUpdateAnnouncement(announcementId, form, accessToken),
      ),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_CHANGED_MESSAGE });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useWithdrawAnnouncementMutation = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (announcementId: number) =>
      withFreshAccessToken((accessToken) =>
        requestWithdrawAnnouncement(announcementId, accessToken),
      ),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: ANNOUNCEMENT_WITHDRAWN_MESSAGE });
    },
    onSettled: () => {
      refreshBoard(queryClient);
    },
  });
};

export const useLastSeenAnnouncementMutation = (): UseMutationResult<
  void,
  Error,
  void,
  LastSeenRollback
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withFreshAccessToken(requestLastSeenAnnouncement),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY });
      const previous = queryClient.getQueryData<Me>(ME_QUERY_KEY);
      const seenAt = new Date().toISOString();

      queryClient.setQueryData<Me>(ME_QUERY_KEY, (current) => applyLastSeen(current, seenAt));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(ME_QUERY_KEY, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};
