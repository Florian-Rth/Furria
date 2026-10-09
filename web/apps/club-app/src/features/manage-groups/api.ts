import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import {
  toGroupCreatedMessage,
  toGroupKindArchivedMessage,
  toGroupKindCreatedMessage,
  toGroupKindRestoredMessage,
  toGroupKindSavedMessage,
  toGroupRestoredMessage,
} from './manage-groups-labels';
import {
  requestGroupCreation,
  requestGroupKindArchival,
  requestGroupKindCreation,
  requestGroupKindRestoration,
  requestGroupKindUpdate,
  requestGroupRestoration,
  requestManagedGroups,
} from './requests';
import type {
  CreatedGroup,
  CreatedGroupKind,
  GroupForm,
  GroupKindForm,
  ManagedGroupsResponse,
} from './schemas';

export interface GroupMutationInput {
  groupId: number;
  name: string;
}

export interface GroupKindNameInput {
  kindName: string;
}

export interface UpdateGroupKindInput {
  groupKindId: number;
  form: GroupKindForm;
}

export const useManagedGroupsQuery = (): UseQueryResult<ManagedGroupsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedGroups,
    queryFn: () => withFreshAccessToken(requestManagedGroups),
  });

export const useCreateGroupMutation = (): UseMutationResult<CreatedGroup, Error, GroupForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['group'] },
    mutationFn: (form: GroupForm) =>
      withFreshAccessToken((accessToken) => requestGroupCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toGroupCreatedMessage(form.name) });
    },
  });
};

export const useRestoreGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['group'] },
    mutationFn: (input: GroupMutationInput) =>
      withFreshAccessToken((accessToken) => requestGroupRestoration(input.groupId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupRestoredMessage(input.name) });
    },
  });
};

export const useCreateGroupKindMutation = (): UseMutationResult<
  CreatedGroupKind,
  Error,
  GroupKindForm
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupKind'] },
    mutationFn: (form: GroupKindForm) =>
      withFreshAccessToken((accessToken) => requestGroupKindCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toGroupKindCreatedMessage(form.name) });
    },
  });
};

export const useUpdateGroupKindMutation = (): UseMutationResult<
  void,
  Error,
  UpdateGroupKindInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupKind'] },
    mutationFn: (input: UpdateGroupKindInput) =>
      withFreshAccessToken((accessToken) =>
        requestGroupKindUpdate(input.groupKindId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindSavedMessage(input.form.name) });
    },
  });
};

export const useArchiveGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupKind'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupKindArchival(groupKindId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindArchivedMessage(input.kindName) });
    },
  });
};

export const useRestoreGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['groupKind'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestGroupKindRestoration(groupKindId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toGroupKindRestoredMessage(input.kindName) });
    },
  });
};
