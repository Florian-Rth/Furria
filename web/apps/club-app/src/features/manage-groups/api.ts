import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MY_GROUPS_QUERY_KEY } from '@/features/group-hub';
import { GROUP_KINDS_QUERY_KEY } from '@/features/group-kinds';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import {
  toGroupArchivedMessage,
  toGroupCreatedMessage,
  toGroupKindArchivedMessage,
  toGroupKindCreatedMessage,
  toGroupKindRestoredMessage,
  toGroupKindSavedMessage,
  toGroupRestoredMessage,
  toGroupSavedMessage,
} from './manage-groups-labels';
import {
  requestGroupArchival,
  requestGroupCreation,
  requestGroupKindArchival,
  requestGroupKindCreation,
  requestGroupKindRestoration,
  requestGroupKindUpdate,
  requestGroupRestoration,
  requestGroupUpdate,
  requestManagedGroups,
} from './requests';
import type {
  CreatedGroup,
  CreatedGroupKind,
  GroupForm,
  GroupKindForm,
  ManagedGroupsResponse,
} from './schemas';

export const MANAGED_GROUPS_QUERY_KEY = ['manage', 'groups'] as const;

export interface GroupMutationInput {
  groupId: number;
  name: string;
}

export interface UpdateGroupInput {
  groupId: number;
  form: GroupForm;
}

export interface GroupKindNameInput {
  kindName: string;
}

export interface UpdateGroupKindInput {
  groupKindId: number;
  form: GroupKindForm;
}

const refreshGroupKinds = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: GROUP_KINDS_QUERY_KEY });
};

const refreshGroups = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MY_GROUPS_QUERY_KEY });
};

export const useRefreshManagedGroups = (): (() => void) => {
  const queryClient = useQueryClient();

  return () => {
    refreshGroups(queryClient);
  };
};

export const useManagedGroupsQuery = (): UseQueryResult<ManagedGroupsResponse, Error> =>
  useQuery({
    queryKey: MANAGED_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManagedGroups),
  });

export const useCreateGroupMutation = (): UseMutationResult<CreatedGroup, Error, GroupForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: GroupForm) =>
      withFreshAccessToken((accessToken) => requestGroupCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toGroupCreatedMessage(form.name) });
      refreshGroups(queryClient);
    },
  });
};

export const useUpdateGroupMutation = (): UseMutationResult<void, Error, UpdateGroupInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: UpdateGroupInput) =>
      withFreshAccessToken((accessToken) =>
        requestGroupUpdate(input.groupId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupSavedMessage(input.form.name) });
      refreshGroups(queryClient);
    },
  });
};

export const useArchiveGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: GroupMutationInput) =>
      withFreshAccessToken((accessToken) => requestGroupArchival(input.groupId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupArchivedMessage(input.name) });
      refreshGroups(queryClient);
    },
  });
};

export const useRestoreGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: GroupMutationInput) =>
      withFreshAccessToken((accessToken) => requestGroupRestoration(input.groupId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupRestoredMessage(input.name) });
      refreshGroups(queryClient);
    },
  });
};

export const useCreateGroupKindMutation = (): UseMutationResult<
  CreatedGroupKind,
  Error,
  GroupKindForm
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: GroupKindForm) =>
      withFreshAccessToken((accessToken) => requestGroupKindCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toGroupKindCreatedMessage(form.name) });
    },
    onSettled: () => {
      refreshGroupKinds(queryClient);
    },
  });
};

export const useUpdateGroupKindMutation = (): UseMutationResult<
  void,
  Error,
  UpdateGroupKindInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: UpdateGroupKindInput) =>
      withFreshAccessToken((accessToken) =>
        requestGroupKindUpdate(input.groupKindId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindSavedMessage(input.form.name) });
    },
    onSettled: () => {
      refreshGroupKinds(queryClient);
    },
  });
};

export const useArchiveGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupKindArchival(groupKindId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindArchivedMessage(input.kindName) });
    },
    onSettled: () => {
      refreshGroupKinds(queryClient);
    },
  });
};

export const useRestoreGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupKindRestoration(groupKindId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindRestoredMessage(input.kindName) });
    },
    onSettled: () => {
      refreshGroupKinds(queryClient);
    },
  });
};
