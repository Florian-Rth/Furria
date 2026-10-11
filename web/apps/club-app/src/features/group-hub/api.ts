import type { KkNoticeRequest } from '@furria/ui';
import type { QueryKey, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';
import { CALENDAR_QUERY_KEY } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { START_QUERY_KEY } from '@/features/start';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toAttendanceSavedMessage } from '@/lib/calendar-copy';
import { toIsoDay } from '@/lib/day';
import type { CalendarEntryWindow } from './group-calendar-entries';
import {
  GROUP_INFO_SAVED_MESSAGE,
  toAdminAppointedMessage,
  toAdminEndedMessage,
  toGroupAdministrationSavedMessage,
  toGroupArchivedFromHubMessage,
  toMemberAddedAsAdminMessage,
  toMemberAddedMessage,
  toMembershipEndedMessage,
  toSelfAdminEndedMessage,
} from './group-hub-labels';
import {
  requestAddGroupAdmin,
  requestAddGroupMembership,
  requestEndGroupAdmin,
  requestEndGroupMembership,
  requestGeneratedTrainings,
  requestGroupAdministrationUpdate,
  requestGroupArchivalFromHub,
  requestGroupAttendanceResponse,
  requestGroupCalendar,
  requestGroupHub,
  requestGroupInfoUpdate,
  requestMyGroups,
  requestPersonSearch,
  requestSetTrainingSlots,
  requestTrainingPreview,
} from './requests';
import type { TrainingSlotPayload } from './rhythm-labels';
import { RHYTHM_SAVED_MESSAGE, toTrainingsCreatedMessage } from './rhythm-labels';
import type {
  AddedGroupAdmin,
  AddedGroupMembership,
  GeneratedTrainings,
  GroupAdministrationForm,
  GroupAttendanceAnswer,
  GroupCalendarResponse,
  GroupHub,
  GroupInfoForm,
  MyGroupsResponse,
  PersonSearchResponse,
  TrainingPreview,
} from './schemas';

const MANAGED_GROUPS_QUERY_KEY = ['manage', 'groups'] as const;

export const MY_GROUPS_QUERY_KEY = ['my-groups'] as const;

export const groupHubQueryKey = (groupId: number | null): readonly [string, number | null] => [
  'groups',
  groupId,
];

export const groupCalendarQueryKey = (
  groupId: number | null,
  from: string,
  to: string,
): readonly [string, number | null, string, string, string] => [
  'groups',
  groupId,
  'calendar',
  from,
  to,
];

export const personSearchQueryKey = (term: string): readonly [string, string] => [
  'person-search',
  term,
];

export interface GroupAttendanceInput {
  calendarEntryId: number;
  answer: GroupAttendanceAnswer;
}

export interface AdminAppointment {
  function: string | null;
}

export interface AddMemberInput {
  personId: number;
  personName: string;
  joinedOn: string;
  admin: AdminAppointment | null;
}

export interface EndMembershipInput {
  groupMembershipId: number;
  personName: string;
  endedOn: string;
}

export interface AddAdminInput {
  personId: number;
  personName: string;
  function: string | null;
  sinceOn: string;
}

export interface EndAdminInput {
  groupAdminId: number;
  personName: string;
  groupName: string;
  isSelf: boolean;
  endedOn: string;
}

const hubScope = (groupId: number): readonly QueryKey[] => [
  groupHubQueryKey(groupId),
  MY_GROUPS_QUERY_KEY,
];

export const useMyGroupsQuery = (): UseQueryResult<MyGroupsResponse, Error> =>
  useQuery({
    queryKey: MY_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMyGroups),
  });

export const useGroupHubQuery = (groupId: number | null): UseQueryResult<GroupHub, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<GroupHub> =>
          withFreshAccessToken((accessToken) => requestGroupHub(groupId, accessToken));

  return useQuery({ queryKey: groupHubQueryKey(groupId), queryFn: load });
};

export const useGroupCalendarQuery = (
  groupId: number | null,
  window: CalendarEntryWindow,
): UseQueryResult<GroupCalendarResponse, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<GroupCalendarResponse> =>
          withFreshAccessToken((accessToken) => requestGroupCalendar(groupId, window, accessToken));

  return useQuery({
    queryKey: groupCalendarQueryKey(groupId, window.from, window.to),
    queryFn: load,
  });
};

export const useGroupAttendanceMutation = (): UseMutationResult<
  void,
  Error,
  GroupAttendanceInput
> =>
  useApiMutation({
    request: ({ calendarEntryId, answer }: GroupAttendanceInput, accessToken) =>
      requestGroupAttendanceResponse(calendarEntryId, answer, accessToken),
    invalidates: [GROUPS_QUERY_KEY, CALENDAR_QUERY_KEY, START_QUERY_KEY],
    notice: { success: ({ answer }) => toAttendanceSavedMessage(answer) },
  });

export const usePersonSearchQuery = (
  term: string | null,
): UseQueryResult<PersonSearchResponse, Error> => {
  const load =
    term === null
      ? skipToken
      : (): Promise<PersonSearchResponse> =>
          withFreshAccessToken((accessToken) => requestPersonSearch(term, accessToken));

  return useQuery({
    queryKey: personSearchQueryKey(term ?? ''),
    queryFn: load,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateGroupInfoMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupInfoForm> =>
  useApiMutation({
    request: (form: GroupInfoForm, accessToken) =>
      requestGroupInfoUpdate(groupId, form, accessToken),
    invalidates: hubScope(groupId),
    notice: { success: () => GROUP_INFO_SAVED_MESSAGE },
  });

export const useUpdateGroupAdministrationMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupAdministrationForm> =>
  useApiMutation({
    request: (form: GroupAdministrationForm, accessToken) =>
      requestGroupAdministrationUpdate(groupId, form, accessToken),
    invalidates: [...hubScope(groupId), MANAGED_GROUPS_QUERY_KEY, GROUPS_QUERY_KEY],
    notice: { success: (form) => toGroupAdministrationSavedMessage(form.name) },
  });

export interface ArchiveGroupFromHubInput {
  name: string;
}

export const useArchiveGroupFromHubMutation = (
  groupId: number,
): UseMutationResult<void, Error, ArchiveGroupFromHubInput> =>
  useApiMutation({
    request: (_input: ArchiveGroupFromHubInput, accessToken) =>
      requestGroupArchivalFromHub(groupId, accessToken),
    invalidates: [...hubScope(groupId), MANAGED_GROUPS_QUERY_KEY, GROUPS_QUERY_KEY],
    notice: { success: (input) => toGroupArchivedFromHubMessage(input.name) },
  });

const requestMembershipWithAdmin = async (
  groupId: number,
  input: AddMemberInput,
  accessToken: string,
): Promise<AddedGroupMembership> => {
  const added = await requestAddGroupMembership(
    groupId,
    { personId: input.personId, joinedOn: input.joinedOn },
    accessToken,
  );

  if (input.admin !== null) {
    await requestAddGroupAdmin(
      groupId,
      { personId: input.personId, function: input.admin.function, sinceOn: input.joinedOn },
      accessToken,
    );
  }

  return added;
};

const toMemberAddedNotice = (input: AddMemberInput): string => {
  const today = toIsoDay(new Date());

  return input.admin === null
    ? toMemberAddedMessage(input.personName, input.joinedOn, today)
    : toMemberAddedAsAdminMessage(input.personName, input.joinedOn, today);
};

const toAdminEndedNotice = (input: EndAdminInput): KkNoticeRequest => {
  const today = toIsoDay(new Date());

  return input.isSelf
    ? { tone: 'info', message: toSelfAdminEndedMessage(input.groupName, input.endedOn, today) }
    : { tone: 'success', message: toAdminEndedMessage(input.personName, input.endedOn, today) };
};

export const useAddGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<AddedGroupMembership, Error, AddMemberInput> =>
  useApiMutation({
    request: (input: AddMemberInput, accessToken) =>
      requestMembershipWithAdmin(groupId, input, accessToken),
    invalidates: hubScope(groupId),
    notice: { success: toMemberAddedNotice },
  });

export const useEndGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndMembershipInput> =>
  useApiMutation({
    request: (input: EndMembershipInput, accessToken) =>
      requestEndGroupMembership(
        groupId,
        { groupMembershipId: input.groupMembershipId, endedOn: input.endedOn },
        accessToken,
      ),
    invalidates: hubScope(groupId),
    notice: {
      success: (input) =>
        toMembershipEndedMessage(input.personName, input.endedOn, toIsoDay(new Date())),
    },
  });

export const useAddGroupAdminMutation = (
  groupId: number,
): UseMutationResult<AddedGroupAdmin, Error, AddAdminInput> =>
  useApiMutation({
    request: (input: AddAdminInput, accessToken) =>
      requestAddGroupAdmin(
        groupId,
        { personId: input.personId, function: input.function, sinceOn: input.sinceOn },
        accessToken,
      ),
    invalidates: hubScope(groupId),
    notice: {
      success: (input) =>
        toAdminAppointedMessage(input.personName, input.sinceOn, toIsoDay(new Date())),
    },
  });

export const useEndGroupAdminMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndAdminInput> =>
  useApiMutation({
    request: (input: EndAdminInput, accessToken) =>
      requestEndGroupAdmin(
        groupId,
        { groupAdminId: input.groupAdminId, endedOn: input.endedOn },
        accessToken,
      ),
    invalidates: hubScope(groupId),
    notice: { success: toAdminEndedNotice },
  });

export const trainingPreviewQueryKey = (
  groupId: number,
  endsOn: string | null,
): readonly [string, number, string, string | null] => [
  'groups',
  groupId,
  'training-preview',
  endsOn,
];

export interface GenerateTrainingsInput {
  title: string;
  instants: readonly { groupTrainingSlotId: number; startsAt: string }[];
}

export const useSetTrainingSlotsMutation = (
  groupId: number,
): UseMutationResult<void, Error, readonly TrainingSlotPayload[]> =>
  useApiMutation({
    request: (slots: readonly TrainingSlotPayload[], accessToken) =>
      requestSetTrainingSlots(groupId, slots, accessToken),
    invalidates: hubScope(groupId),
    notice: { success: () => RHYTHM_SAVED_MESSAGE },
  });

export const useTrainingPreviewQuery = (
  groupId: number,
  endsOn: string | null,
  enabled: boolean,
): UseQueryResult<TrainingPreview, Error> => {
  const load = enabled
    ? (): Promise<TrainingPreview> =>
        withFreshAccessToken((accessToken) => requestTrainingPreview(groupId, endsOn, accessToken))
    : skipToken;

  return useQuery({
    queryKey: trainingPreviewQueryKey(groupId, endsOn),
    queryFn: load,
    placeholderData: keepPreviousData,
  });
};

export const useGenerateTrainingsMutation = (
  groupId: number,
): UseMutationResult<GeneratedTrainings, Error, GenerateTrainingsInput> =>
  useApiMutation({
    request: (input: GenerateTrainingsInput, accessToken) =>
      requestGeneratedTrainings(groupId, input.title, input.instants, accessToken),
    invalidates: [groupHubQueryKey(groupId), CALENDAR_QUERY_KEY, CLUB_HUB_QUERY_KEY],
    notice: {
      success: (_input, written) =>
        toTrainingsCreatedMessage(written.createdCount, written.skippedCount),
    },
  });
