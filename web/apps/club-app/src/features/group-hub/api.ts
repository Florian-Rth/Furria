import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import type { CalendarEntryWindow } from './group-calendar-entries';
import {
  GROUP_INFO_SAVED_MESSAGE,
  toAdminAppointedMessage,
  toAdminEndedMessage,
  toGroupAdministrationSavedMessage,
  toGroupArchivedFromHubMessage,
  toMemberAddedAdminFailedMessage,
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
  GeneratedTrainings,
  GroupAdministrationForm,
  GroupCalendarResponse,
  GroupHub,
  GroupInfoForm,
  MyGroupsResponse,
  PersonSearchResponse,
  TrainingPreview,
} from './schemas';

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

export const useMyGroupsQuery = (): UseQueryResult<MyGroupsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.myGroups,
    queryFn: () => withFreshAccessToken(requestMyGroups),
  });

export const useGroupHubQuery = (groupId: number | null): UseQueryResult<GroupHub, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<GroupHub> =>
          withFreshAccessToken((accessToken) => requestGroupHub(groupId, accessToken));

  return useQuery({ queryKey: queryKeys.groupHub(groupId), queryFn: load });
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
    queryKey: queryKeys.groupCalendar(groupId, window.from, window.to),
    queryFn: load,
  });
};

export const usePersonSearchQuery = (
  term: string | null,
): UseQueryResult<PersonSearchResponse, Error> => {
  const load =
    term === null
      ? skipToken
      : (): Promise<PersonSearchResponse> =>
          withFreshAccessToken((accessToken) => requestPersonSearch(term, accessToken));

  return useQuery({
    queryKey: queryKeys.personSearch(term ?? ''),
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
    changes: ['group'],
    notice: { success: () => GROUP_INFO_SAVED_MESSAGE },
  });

export const useUpdateGroupAdministrationMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupAdministrationForm> =>
  useApiMutation({
    request: (form: GroupAdministrationForm, accessToken) =>
      requestGroupAdministrationUpdate(groupId, form, accessToken),
    changes: ['group'],
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
    changes: ['group'],
    notice: { success: (input) => toGroupArchivedFromHubMessage(input.name) },
  });

export type AdminAppointmentOutcome = 'none' | 'appointed' | 'failed';

export interface MemberAdmission {
  groupMembershipId: number;
  adminAppointment: AdminAppointmentOutcome;
}

const requestAdminAppointment = async (
  groupId: number,
  input: AddMemberInput,
  accessToken: string,
): Promise<AdminAppointmentOutcome> => {
  if (input.admin === null) {
    return 'none';
  }

  try {
    await requestAddGroupAdmin(
      groupId,
      { personId: input.personId, function: input.admin.function, sinceOn: input.joinedOn },
      accessToken,
    );

    return 'appointed';
  } catch {
    return 'failed';
  }
};

const requestMembershipWithAdmin = async (
  groupId: number,
  input: AddMemberInput,
  accessToken: string,
): Promise<MemberAdmission> => {
  const added = await requestAddGroupMembership(
    groupId,
    { personId: input.personId, joinedOn: input.joinedOn },
    accessToken,
  );
  const adminAppointment = await requestAdminAppointment(groupId, input, accessToken);

  return { groupMembershipId: added.groupMembershipId, adminAppointment };
};

const toMemberAddedNotice = (input: AddMemberInput, result: MemberAdmission): KkNoticeRequest => {
  const today = toIsoDay(new Date());

  switch (result.adminAppointment) {
    case 'none':
      return {
        tone: 'success',
        message: toMemberAddedMessage(input.personName, input.joinedOn, today),
      };
    case 'appointed':
      return {
        tone: 'success',
        message: toMemberAddedAsAdminMessage(input.personName, input.joinedOn, today),
      };
    case 'failed':
      return {
        tone: 'error',
        message: toMemberAddedAdminFailedMessage(input.personName, input.joinedOn, today),
      };
  }
};

const toAdminEndedNotice = (input: EndAdminInput): KkNoticeRequest => {
  const today = toIsoDay(new Date());

  return input.isSelf
    ? { tone: 'info', message: toSelfAdminEndedMessage(input.groupName, input.endedOn, today) }
    : { tone: 'success', message: toAdminEndedMessage(input.personName, input.endedOn, today) };
};

export const useAddGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<MemberAdmission, Error, AddMemberInput> =>
  useApiMutation({
    request: (input: AddMemberInput, accessToken) =>
      requestMembershipWithAdmin(groupId, input, accessToken),
    changes: ['groupMembership', 'groupAdmin'],
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
    changes: ['groupMembership'],
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
    changes: ['groupAdmin'],
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
    changes: ['groupAdmin'],
    notice: { success: toAdminEndedNotice },
  });

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
    changes: ['trainingSlot'],
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
    queryKey: queryKeys.trainingPreview(groupId, endsOn),
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
    changes: ['calendarEntry'],
    notice: {
      success: (_input, written) =>
        toTrainingsCreatedMessage(written.createdCount, written.skippedCount),
    },
  });
