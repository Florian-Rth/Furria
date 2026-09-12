import { useKkToast } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import {
  GROUP_INFO_SAVED_MESSAGE,
  toAdminAppointedMessage,
  toAdminEndedMessage,
  toMemberAddedMessage,
  toMembershipEndedMessage,
} from './group-hub-labels';
import { toWriteErrorMessage } from './group-hub-messages';
import {
  requestAddGroupAdmin,
  requestAddGroupMembership,
  requestEndGroupAdmin,
  requestEndGroupMembership,
  requestGroupInfoUpdate,
  requestMyGroup,
  requestMyGroups,
  requestPersonSearch,
} from './requests';
import type {
  AddedGroupAdmin,
  AddedGroupMembership,
  GroupInfoForm,
  HubDetails,
  MyGroupsResponse,
  PersonSearchResponse,
} from './schemas';

export const MY_GROUPS_QUERY_KEY = ['my-groups'] as const;

export const myGroupQueryKey = (groupId: number | null): readonly [string, number | null] => [
  'my-groups',
  groupId,
];

export const personSearchQueryKey = (term: string): readonly [string, string] => [
  'person-search',
  term,
];

export interface AddMemberInput {
  personId: number;
  personName: string;
  joinedOn: string;
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
  endedOn: string;
}

const refreshHub = (queryClient: QueryClient, groupId: number): void => {
  void queryClient.invalidateQueries({ queryKey: myGroupQueryKey(groupId) });
  void queryClient.invalidateQueries({ queryKey: MY_GROUPS_QUERY_KEY });
};

export const useMyGroupsQuery = (): UseQueryResult<MyGroupsResponse, Error> =>
  useQuery({
    queryKey: MY_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestMyGroups),
  });

export const useMyGroupQuery = (groupId: number | null): UseQueryResult<HubDetails, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<HubDetails> =>
          withFreshAccessToken((accessToken) => requestMyGroup(groupId, accessToken));

  return useQuery({ queryKey: myGroupQueryKey(groupId), queryFn: load });
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
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: GroupInfoForm) =>
      withFreshAccessToken((accessToken) => requestGroupInfoUpdate(groupId, form, accessToken)),
    onSuccess: () => {
      showToast({ tone: 'success', message: GROUP_INFO_SAVED_MESSAGE });
      refreshHub(queryClient, groupId);
    },
    onError: (error) => {
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        showToast({ tone: 'error', message });
      }
      refreshHub(queryClient, groupId);
    },
  });
};

export const useAddGroupMembershipMutation = (
  groupId: number,
): UseMutationResult<AddedGroupMembership, Error, AddMemberInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: AddMemberInput) =>
      withFreshAccessToken((accessToken) =>
        requestAddGroupMembership(
          groupId,
          { personId: input.personId, joinedOn: input.joinedOn },
          accessToken,
        ),
      ),
    onSuccess: (_added, input) => {
      const message = toMemberAddedMessage(input.personName, input.joinedOn, toIsoDay(new Date()));

      showToast({ tone: 'success', message });
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
  const showToast = useKkToast();

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

      showToast({ tone: 'success', message });
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
  const showToast = useKkToast();

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

      showToast({ tone: 'success', message });
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
  const showToast = useKkToast();

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
      const message = toAdminEndedMessage(input.personName, input.endedOn, toIsoDay(new Date()));

      showToast({ tone: 'success', message });
      refreshHub(queryClient, groupId);
    },
    onError: () => {
      refreshHub(queryClient, groupId);
    },
  });
};
