import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { MY_GROUPS_QUERY_KEY } from '@/features/group-hub';
import { GROUP_KINDS_QUERY_KEY } from '@/features/group-kinds';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
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

export const MANAGED_GROUPS_QUERY_KEY = ['manage', 'groups'] as const;

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

const GROUP_KINDS_SCOPE = [MANAGED_GROUPS_QUERY_KEY, GROUP_KINDS_QUERY_KEY] as const;

const GROUPS_SCOPE = [MANAGED_GROUPS_QUERY_KEY, GROUPS_QUERY_KEY, MY_GROUPS_QUERY_KEY] as const;

export const useManagedGroupsQuery = (): UseQueryResult<ManagedGroupsResponse, Error> =>
  useQuery({
    queryKey: MANAGED_GROUPS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManagedGroups),
  });

export const useCreateGroupMutation = (): UseMutationResult<CreatedGroup, Error, GroupForm> =>
  useApiMutation({
    request: requestGroupCreation,
    invalidates: GROUPS_SCOPE,
    notice: { success: (form) => toGroupCreatedMessage(form.name) },
  });

export const useRestoreGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> =>
  useApiMutation({
    request: (input: GroupMutationInput, accessToken) =>
      requestGroupRestoration(input.groupId, accessToken),
    invalidates: GROUPS_SCOPE,
    notice: { success: (input) => toGroupRestoredMessage(input.name) },
  });

export const useCreateGroupKindMutation = (): UseMutationResult<
  CreatedGroupKind,
  Error,
  GroupKindForm
> =>
  useApiMutation({
    request: requestGroupKindCreation,
    invalidates: GROUP_KINDS_SCOPE,
    notice: { success: (form) => toGroupKindCreatedMessage(form.name) },
  });

export const useUpdateGroupKindMutation = (): UseMutationResult<
  void,
  Error,
  UpdateGroupKindInput
> =>
  useApiMutation({
    request: (input: UpdateGroupKindInput, accessToken) =>
      requestGroupKindUpdate(input.groupKindId, input.form, accessToken),
    invalidates: GROUP_KINDS_SCOPE,
    notice: { success: (input) => toGroupKindSavedMessage(input.form.name) },
  });

export const useArchiveGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> =>
  useApiMutation({
    request: (_input: GroupKindNameInput, accessToken) =>
      requestGroupKindArchival(groupKindId, accessToken),
    invalidates: GROUP_KINDS_SCOPE,
    notice: { success: (input) => toGroupKindArchivedMessage(input.kindName) },
  });

export const useRestoreGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> =>
  useApiMutation({
    request: (_input: GroupKindNameInput, accessToken) =>
      requestGroupKindRestoration(groupKindId, accessToken),
    invalidates: GROUP_KINDS_SCOPE,
    notice: { success: (input) => toGroupKindRestoredMessage(input.kindName) },
  });
