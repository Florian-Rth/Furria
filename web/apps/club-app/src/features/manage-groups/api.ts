import { useKkToast } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MY_GROUPS_QUERY_KEY } from '@/features/group-hub';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import {
  toGroupArchivedMessage,
  toGroupCreatedMessage,
  toGroupRestoredMessage,
  toGroupSavedMessage,
} from './manage-groups-labels';
import {
  requestGroupArchival,
  requestGroupCreation,
  requestGroupRestoration,
  requestGroupUpdate,
  requestManagedGroup,
  requestManagedGroups,
} from './requests';
import type {
  CreatedGroup,
  GroupForm,
  ManagedGroupDetails,
  ManagedGroupsResponse,
} from './schemas';

export const MANAGED_GROUPS_QUERY_KEY = ['manage', 'groups'] as const;

export const managedGroupQueryKey = (
  groupId: number | null,
): readonly [string, string, number | null] => ['manage', 'groups', groupId];

export interface GroupMutationInput {
  groupId: number;
  name: string;
}

export interface UpdateGroupInput {
  groupId: number;
  form: GroupForm;
}

const refreshGroups = (queryClient: QueryClient, groupId: number | null): void => {
  void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MY_GROUPS_QUERY_KEY });

  if (groupId !== null) {
    void queryClient.invalidateQueries({ queryKey: managedGroupQueryKey(groupId) });
  }
};

export const useManagedGroupsQuery = (): UseQueryResult<ManagedGroupsResponse, Error> =>
  useQuery({
    queryKey: MANAGED_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManagedGroups),
  });

export const useManagedGroupQuery = (
  groupId: number | null,
): UseQueryResult<ManagedGroupDetails, Error> => {
  const load =
    groupId === null
      ? skipToken
      : (): Promise<ManagedGroupDetails> =>
          withFreshAccessToken((accessToken) => requestManagedGroup(groupId, accessToken));

  return useQuery({ queryKey: managedGroupQueryKey(groupId), queryFn: load });
};

export const useCreateGroupMutation = (): UseMutationResult<CreatedGroup, Error, GroupForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: GroupForm) =>
      withFreshAccessToken((accessToken) => requestGroupCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      showToast({ tone: 'success', message: toGroupCreatedMessage(form.name) });
      refreshGroups(queryClient, null);
    },
  });
};

export const useUpdateGroupMutation = (): UseMutationResult<void, Error, UpdateGroupInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: UpdateGroupInput) =>
      withFreshAccessToken((accessToken) =>
        requestGroupUpdate(input.groupId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      showToast({ tone: 'success', message: toGroupSavedMessage(input.form.name) });
      refreshGroups(queryClient, input.groupId);
    },
  });
};

export const useArchiveGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: GroupMutationInput) =>
      withFreshAccessToken((accessToken) => requestGroupArchival(input.groupId, accessToken)),
    onSuccess: (_result, input) => {
      showToast({ tone: 'success', message: toGroupArchivedMessage(input.name) });
      refreshGroups(queryClient, input.groupId);
    },
  });
};

export const useRestoreGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: GroupMutationInput) =>
      withFreshAccessToken((accessToken) => requestGroupRestoration(input.groupId, accessToken)),
    onSuccess: (_result, input) => {
      showToast({ tone: 'success', message: toGroupRestoredMessage(input.name) });
      refreshGroups(queryClient, input.groupId);
    },
  });
};
