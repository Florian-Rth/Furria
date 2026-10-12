import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
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
> =>
  useApiMutation({
    request: requestCreateAnnouncement,
    changes: ['announcement'],
    notice: { success: () => ANNOUNCEMENT_POSTED_MESSAGE },
  });

export const useUpdateAnnouncementMutation = (
  announcementId: number,
): UseMutationResult<void, Error, AnnouncementForm> =>
  useApiMutation({
    request: (form: AnnouncementForm, accessToken) =>
      requestUpdateAnnouncement(announcementId, form, accessToken),
    changes: ['announcement'],
    notice: { success: () => ANNOUNCEMENT_CHANGED_MESSAGE },
  });

export const useWithdrawAnnouncementMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestWithdrawAnnouncement,
    changes: ['announcement'],
    notice: { success: () => ANNOUNCEMENT_WITHDRAWN_MESSAGE },
  });

export const useLastSeenAnnouncementMutation = (): UseMutationResult<void, Error, LastSeenInput> =>
  useApiMutation({
    request: ({ seenUpTo }: LastSeenInput, accessToken) =>
      requestLastSeenAnnouncement(seenUpTo, accessToken),
    optimistic: [
      optimisticPatch(queryKeys.me, (current: Me | undefined, { seenUpTo }: LastSeenInput) =>
        applyLastSeen(current, seenUpTo, new Date()),
      ),
    ],
    changes: ['announcementSeen'],
  });
