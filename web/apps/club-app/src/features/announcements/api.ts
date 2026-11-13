import type { MutationKey, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toAttendanceSavedMessage } from '@/lib/calendar-copy';
import { queryKeys } from '@/lib/query/reads';
import type { AnnouncementPayload } from './announcement-add-ons';
import {
  ANNOUNCEMENT_ANSWER_FAILED_MESSAGE,
  ANNOUNCEMENT_ATTENDANCE_CLOSE_FAILED_MESSAGE,
  ANNOUNCEMENT_CHANGED_MESSAGE,
  ANNOUNCEMENT_POSTED_MESSAGE,
  ANNOUNCEMENT_WITHDRAWN_MESSAGE,
} from './announcements-labels';
import { toNextLastSeenAt } from './last-seen';
import {
  requestAnnouncementAnswer,
  requestAnnouncementAttendanceClosing,
  requestAnnouncementMentionables,
  requestAnnouncements,
  requestCreateAnnouncement,
  requestLastSeenAnnouncement,
  requestUpdateAnnouncement,
  requestWithdrawAnnouncement,
} from './requests';
import type {
  AnnouncementMentionables,
  AnnouncementsResponse,
  CreatedAnnouncement,
} from './schemas';

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

export const useFreshAnnouncementsQuery = (): UseQueryResult<AnnouncementsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.announcements,
    queryFn: () => withFreshAccessToken(requestAnnouncements),
    refetchOnMount: 'always',
  });

export const useAnnouncementMentionablesQuery = (): UseQueryResult<
  AnnouncementMentionables,
  Error
> =>
  useQuery({
    queryKey: queryKeys.announcementMentionables,
    queryFn: () => withFreshAccessToken(requestAnnouncementMentionables),
  });

export const useCreateAnnouncementMutation = (): UseMutationResult<
  CreatedAnnouncement,
  Error,
  AnnouncementPayload
> =>
  useApiMutation({
    request: requestCreateAnnouncement,
    changes: ['announcement'],
    notice: { success: () => ANNOUNCEMENT_POSTED_MESSAGE },
  });

export const useUpdateAnnouncementMutation = (
  announcementId: number,
): UseMutationResult<void, Error, AnnouncementPayload> =>
  useApiMutation({
    request: (payload: AnnouncementPayload, accessToken) =>
      requestUpdateAnnouncement(announcementId, payload, accessToken),
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

export const announcementAnswerMutationKey = (announcementId: number): MutationKey => [
  'announcement-answer',
  announcementId,
];

export const useAnnouncementAnswerMutation = (
  announcementId: number,
): UseMutationResult<void, Error, AttendanceAnswer> =>
  useApiMutation({
    key: announcementAnswerMutationKey(announcementId),
    request: (answer: AttendanceAnswer, accessToken) =>
      requestAnnouncementAnswer(announcementId, answer, accessToken),
    changes: ['attendanceResponse'],
    notice: {
      success: (answer) => toAttendanceSavedMessage(answer),
      failure: () => ANNOUNCEMENT_ANSWER_FAILED_MESSAGE,
    },
  });

export const useAnnouncementAttendanceClosingMutation = (): UseMutationResult<
  void,
  Error,
  number
> =>
  useApiMutation({
    request: requestAnnouncementAttendanceClosing,
    changes: ['announcement'],
    notice: { failure: () => ANNOUNCEMENT_ATTENDANCE_CLOSE_FAILED_MESSAGE },
  });
