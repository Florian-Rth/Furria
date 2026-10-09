import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useMutation, useQuery } from '@tanstack/react-query';
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
  AddedGroupMembership,
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
): UseMutationResult<void, Error, GroupInfoForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['group'] },
    mutationFn: (form: GroupInfoForm) =>
      withFreshAccessToken((accessToken) => requestGroupInfoUpdate(groupId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: GROUP_INFO_SAVED_MESSAGE });
    },
  });
};

export const useUpdateGroupAdministrationMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupAdministrationForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['group'] },
    mutationFn: (form: GroupAdministrationForm) =>
      withFreshAccessToken((accessToken) =>
        requestGroupAdministrationUpdate(groupId, form, accessToken),
      ),
    onSuccess: (_result, form) => {
      raiseNotice({ tone: 'success', message: toGroupAdministrationSavedMessage(form.name) });
    },
  });
};

export interface ArchiveGroupFromHubInput {
  name: string;
}

export const useArchiveGroupFromHubMutation = (
  groupId: number,
): UseMutationResult<void, Error, ArchiveGroupFromHubInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['group'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupArchivalFromHub(groupId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupArchivedFromHubMessage(input.name) });
    },
  });
};

export const useAddGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<AddedGroupMembership, Error, AddMemberInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupMembership', 'groupAdmin'] },
    mutationFn: (input: AddMemberInput) =>
      withFreshAccessToken(async (accessToken) => {
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
      }),
    onSuccess: (_added, input) => {
      const today = toIsoDay(new Date());
      const message =
        input.admin === null
          ? toMemberAddedMessage(input.personName, input.joinedOn, today)
          : toMemberAddedAsAdminMessage(input.personName, input.joinedOn, today);

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useEndGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndMembershipInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupMembership'] },
    mutationFn: (input: EndMembershipInput) =>
      withFreshAccessToken((accessToken) =>
        requestEndGroupMembership(
          groupId,
          { groupMembershipId: input.groupMembershipId, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: (_result, input) => {
      const message = toMembershipEndedMessage(
        input.personName,
        input.endedOn,
        toIsoDay(new Date()),
      );

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useAddGroupAdminMutation = (
  groupId: number,
): UseMutationResult<AddedGroupAdmin, Error, AddAdminInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupAdmin'] },
    mutationFn: (input: AddAdminInput) =>
      withFreshAccessToken((accessToken) =>
        requestAddGroupAdmin(
          groupId,
          { personId: input.personId, function: input.function, sinceOn: input.sinceOn },
          accessToken,
        ),
      ),
    onSuccess: (_added, input) => {
      const message = toAdminAppointedMessage(
        input.personName,
        input.sinceOn,
        toIsoDay(new Date()),
      );

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useEndGroupAdminMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndAdminInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupAdmin'] },
    mutationFn: (input: EndAdminInput) =>
      withFreshAccessToken((accessToken) =>
        requestEndGroupAdmin(
          groupId,
          { groupAdminId: input.groupAdminId, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: (_result, input) => {
      const today = toIsoDay(new Date());

      if (input.isSelf) {
        raiseNotice({
          tone: 'info',
          message: toSelfAdminEndedMessage(input.groupName, input.endedOn, today),
        });
      } else {
        raiseNotice({
          tone: 'success',
          message: toAdminEndedMessage(input.personName, input.endedOn, today),
        });
      }
    },
  });
};

export interface GenerateTrainingsInput {
  title: string;
  instants: readonly { groupTrainingSlotId: number; startsAt: string }[];
}

export const useSetTrainingSlotsMutation = (
  groupId: number,
): UseMutationResult<void, Error, readonly TrainingSlotPayload[]> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['trainingSlot'] },
    mutationFn: (slots: readonly TrainingSlotPayload[]) =>
      withFreshAccessToken((accessToken) => requestSetTrainingSlots(groupId, slots, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: RHYTHM_SAVED_MESSAGE });
    },
  });
};

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
): UseMutationResult<GeneratedTrainings, Error, GenerateTrainingsInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['calendarEntry'] },
    mutationFn: (input: GenerateTrainingsInput) =>
      withFreshAccessToken((accessToken) =>
        requestGeneratedTrainings(groupId, input.title, input.instants, accessToken),
      ),
    onSuccess: (written) => {
      raiseNotice({
        tone: 'success',
        message: toTrainingsCreatedMessage(written.createdCount, written.skippedCount),
      });
    },
  });
};
