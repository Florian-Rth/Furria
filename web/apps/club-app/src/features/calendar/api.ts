import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type { CalendarEntryPayload } from './calendar-authoring';
import { toEntryWriteNotice } from './calendar-authoring';
import {
  POLL_CLOSE_FAILED_MESSAGE,
  POLL_REOPEN_FAILED_MESSAGE,
  POLL_VOTE_FAILED_MESSAGE,
  REMINDER_FAILURE_MESSAGES,
  REMINDER_SENT_MESSAGE,
  SIGN_UP_LINE_DELETE_FAILED_MESSAGE,
  SIGN_UP_LINE_REMOVE_FAILED_MESSAGE,
  SIGN_UP_LINE_SAVE_FAILED_MESSAGE,
  SIGN_UP_LIST_CLOSE_FAILED_MESSAGE,
  toEntryCreatedMessage,
  toEntryDeletedMessage,
  toEntrySavedMessage,
} from './calendar-labels';
import type { CalendarQuery } from './calendar-query';
import { toReminderFailure } from './calendar-reminders';
import {
  requestCalendar,
  requestCalendarEntry,
  requestCalendarEntryCreation,
  requestCalendarEntryDeletion,
  requestCalendarEntryUpdate,
  requestCalendarReminder,
  requestChoosablePeople,
  requestOwnSignUpLine,
  requestOwnSignUpLineDeletion,
  requestPollClosing,
  requestPollReopening,
  requestPollVotes,
  requestRunningVenues,
  requestSignUpLineRemoval,
  requestSignUpListClosing,
} from './requests';
import type {
  CalendarEntryResponse,
  CalendarReminderTarget,
  CalendarResponse,
  ChoosablePeopleResponse,
  RunningVenuesResponse,
  WrittenCalendarEntry,
} from './schemas';

export const useCalendarQuery = (query: CalendarQuery): UseQueryResult<CalendarResponse, Error> =>
  useQuery({
    queryKey: queryKeys.calendar(query.scope, query.groupId, query.from, query.to),
    queryFn: () => withFreshAccessToken((accessToken) => requestCalendar(query, accessToken)),
    placeholderData: keepPreviousData,
  });

export const useCalendarEntryQuery = (
  calendarEntryId: number | null,
): UseQueryResult<CalendarEntryResponse, Error> =>
  useQuery({
    queryKey: queryKeys.calendarEntry(calendarEntryId),
    queryFn:
      calendarEntryId === null
        ? skipToken
        : () =>
            withFreshAccessToken((accessToken) =>
              requestCalendarEntry(calendarEntryId, accessToken),
            ),
  });

export const useRunningVenuesQuery = (): UseQueryResult<RunningVenuesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.runningVenues,
    queryFn: () => withFreshAccessToken((accessToken) => requestRunningVenues(accessToken)),
  });

export const useChoosablePeopleQuery = (): UseQueryResult<ChoosablePeopleResponse, Error> =>
  useQuery({
    queryKey: queryKeys.choosablePeople,
    queryFn: () => withFreshAccessToken((accessToken) => requestChoosablePeople(accessToken)),
  });

export interface CalendarEntryInput {
  payload: CalendarEntryPayload;
}

export interface CalendarEntryUpdateInput extends CalendarEntryInput {
  calendarEntryId: number;
}

export interface CalendarEntryDeletionInput {
  calendarEntryId: number;
  title: string;
}

export const useCreateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryInput
> =>
  useApiMutation({
    request: ({ payload }: CalendarEntryInput, accessToken) =>
      requestCalendarEntryCreation(payload, accessToken),
    changes: ['calendarEntry'],
    notice: {
      success: ({ payload }, written) =>
        toEntryWriteNotice(toEntryCreatedMessage(payload.title), written.venueCollisions),
    },
  });

export const useUpdateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryUpdateInput
> =>
  useApiMutation({
    request: ({ calendarEntryId, payload }: CalendarEntryUpdateInput, accessToken) =>
      requestCalendarEntryUpdate(calendarEntryId, payload, accessToken),
    changes: ['calendarEntry'],
    notice: {
      success: ({ payload }, written) =>
        toEntryWriteNotice(toEntrySavedMessage(payload.title), written.venueCollisions),
    },
  });

export const useDeleteCalendarEntryMutation = (): UseMutationResult<
  void,
  Error,
  CalendarEntryDeletionInput
> =>
  useApiMutation({
    request: ({ calendarEntryId }: CalendarEntryDeletionInput, accessToken) =>
      requestCalendarEntryDeletion(calendarEntryId, accessToken),
    changes: ['calendarEntry'],
    notice: { success: ({ title }) => toEntryDeletedMessage(title) },
  });

export interface PollVoteInput {
  pollId: number;
  optionIds: number[];
}

export interface PollInput {
  pollId: number;
}

export const usePollVoteMutation = (): UseMutationResult<void, Error, PollVoteInput> =>
  useApiMutation({
    request: ({ pollId, optionIds }: PollVoteInput, accessToken) =>
      requestPollVotes(pollId, optionIds, accessToken),
    changes: ['calendarPollVote'],
    notice: { failure: () => POLL_VOTE_FAILED_MESSAGE },
  });

const usePollStateMutation = (
  request: (pollId: number, accessToken: string) => Promise<void>,
  failureMessage: string,
): UseMutationResult<void, Error, PollInput> =>
  useApiMutation({
    request: ({ pollId }: PollInput, accessToken) => request(pollId, accessToken),
    changes: ['calendarEntry'],
    notice: { failure: () => failureMessage },
  });

export const usePollClosingMutation = (): UseMutationResult<void, Error, PollInput> =>
  usePollStateMutation(requestPollClosing, POLL_CLOSE_FAILED_MESSAGE);

export const usePollReopeningMutation = (): UseMutationResult<void, Error, PollInput> =>
  usePollStateMutation(requestPollReopening, POLL_REOPEN_FAILED_MESSAGE);

export interface OwnSignUpLineInput {
  signUpListId: number;
  text: string | null;
}

export interface SignUpListInput {
  signUpListId: number;
}

export interface SignUpLineRemovalInput {
  lineId: number;
}

export const useOwnSignUpLineMutation = (): UseMutationResult<void, Error, OwnSignUpLineInput> =>
  useApiMutation({
    request: ({ signUpListId, text }: OwnSignUpLineInput, accessToken) =>
      requestOwnSignUpLine(signUpListId, text, accessToken),
    changes: ['calendarSignUpLine'],
    notice: { failure: () => SIGN_UP_LINE_SAVE_FAILED_MESSAGE },
  });

export const useOwnSignUpLineDeletionMutation = (): UseMutationResult<
  void,
  Error,
  SignUpListInput
> =>
  useApiMutation({
    request: ({ signUpListId }: SignUpListInput, accessToken) =>
      requestOwnSignUpLineDeletion(signUpListId, accessToken),
    changes: ['calendarSignUpLine'],
    notice: { failure: () => SIGN_UP_LINE_DELETE_FAILED_MESSAGE },
  });

export const useSignUpLineRemovalMutation = (): UseMutationResult<
  void,
  Error,
  SignUpLineRemovalInput
> =>
  useApiMutation({
    request: ({ lineId }: SignUpLineRemovalInput, accessToken) =>
      requestSignUpLineRemoval(lineId, accessToken),
    changes: ['calendarSignUpLine'],
    notice: { failure: () => SIGN_UP_LINE_REMOVE_FAILED_MESSAGE },
  });

export const useSignUpListClosingMutation = (): UseMutationResult<void, Error, SignUpListInput> =>
  useApiMutation({
    request: ({ signUpListId }: SignUpListInput, accessToken) =>
      requestSignUpListClosing(signUpListId, accessToken),
    changes: ['calendarEntry'],
    notice: { failure: () => SIGN_UP_LIST_CLOSE_FAILED_MESSAGE },
  });

export const useCalendarReminderMutation = (): UseMutationResult<
  void,
  Error,
  CalendarReminderTarget
> =>
  useApiMutation({
    request: (target: CalendarReminderTarget, accessToken) =>
      requestCalendarReminder(target, accessToken),
    changes: ['calendarEntry'],
    notice: {
      success: () => REMINDER_SENT_MESSAGE,
      failure: (error) => REMINDER_FAILURE_MESSAGES[toReminderFailure(error)],
    },
  });
