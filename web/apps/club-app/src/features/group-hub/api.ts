import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CALENDAR_QUERY_KEY } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toAttendanceSavedMessage } from '@/lib/calendar-copy';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
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
import type { TermineWindow } from './group-termine';
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

const refreshHub = (queryClient: QueryClient, groupId: number): void => {
  void queryClient.invalidateQueries({ queryKey: groupHubQueryKey(groupId) });
  void queryClient.invalidateQueries({ queryKey: MY_GROUPS_QUERY_KEY });
};

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
  window: TermineWindow,
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

export const useGroupAttendanceMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupAttendanceInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  const refreshCalendar = (): void => {
    void queryClient.invalidateQueries({ queryKey: groupHubQueryKey(groupId) });
  };

  return useMutation({
    mutationFn: ({ calendarEntryId, answer }: GroupAttendanceInput) =>
      withFreshAccessToken((accessToken) =>
        requestGroupAttendanceResponse(calendarEntryId, answer, accessToken),
      ),
    onSuccess: (_saved, { answer }) => {
      raiseNotice({ tone: 'success', message: toAttendanceSavedMessage(answer) });
      refreshCalendar();
    },
    onError: (error) => {
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
      refreshCalendar();
    },
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
    queryKey: personSearchQueryKey(term ?? ''),
    queryFn: load,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateGroupInfoMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupInfoForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: GroupInfoForm) =>
      withFreshAccessToken((accessToken) => requestGroupInfoUpdate(groupId, form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: GROUP_INFO_SAVED_MESSAGE });
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

export const useUpdateGroupAdministrationMutation = (
  groupId: number,
): UseMutationResult<void, Error, GroupAdministrationForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: GroupAdministrationForm) =>
      withFreshAccessToken((accessToken) =>
        requestGroupAdministrationUpdate(groupId, form, accessToken),
      ),
    onSuccess: (_result, form) => {
      raiseNotice({ tone: 'success', message: toGroupAdministrationSavedMessage(form.name) });
      refreshHub(queryClient, groupId);
      void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

export interface ArchiveGroupFromHubInput {
  name: string;
}

export const useArchiveGroupFromHubMutation = (
  groupId: number,
): UseMutationResult<void, Error, ArchiveGroupFromHubInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupArchivalFromHub(groupId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupArchivedFromHubMessage(input.name) });
      void queryClient.invalidateQueries({ queryKey: groupHubQueryKey(groupId) });
      void queryClient.invalidateQueries({ queryKey: MY_GROUPS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useAddGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<AddedGroupMembership, Error, AddMemberInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

export const useEndGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndMembershipInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

export const useAddGroupAdminMutation = (
  groupId: number,
): UseMutationResult<AddedGroupAdmin, Error, AddAdminInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

export const useEndGroupAdminMutation = (
  groupId: number,
): UseMutationResult<void, Error, EndAdminInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
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
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};

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

const refreshTermine = (queryClient: QueryClient, groupId: number): void => {
  void queryClient.invalidateQueries({ queryKey: groupHubQueryKey(groupId) });
  void queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

export const useSetTrainingSlotsMutation = (
  groupId: number,
): UseMutationResult<void, Error, readonly TrainingSlotPayload[]> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (slots: readonly TrainingSlotPayload[]) =>
      withFreshAccessToken((accessToken) => requestSetTrainingSlots(groupId, slots, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: RHYTHM_SAVED_MESSAGE });
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
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
    queryKey: trainingPreviewQueryKey(groupId, endsOn),
    queryFn: load,
    placeholderData: keepPreviousData,
  });
};

export const useGenerateTrainingsMutation = (
  groupId: number,
): UseMutationResult<GeneratedTrainings, Error, GenerateTrainingsInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: GenerateTrainingsInput) =>
      withFreshAccessToken((accessToken) =>
        requestGeneratedTrainings(groupId, input.title, input.instants, accessToken),
      ),
    onSuccess: (written) => {
      raiseNotice({
        tone: 'success',
        message: toTrainingsCreatedMessage(written.createdCount, written.skippedCount),
      });
      refreshTermine(queryClient, groupId);
    },
  });
};
