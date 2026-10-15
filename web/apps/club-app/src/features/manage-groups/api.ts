import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
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

export const useManagedGroupsQuery = (
  enabled = true,
): UseQueryResult<ManagedGroupsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedGroups,
    queryFn: () => withFreshAccessToken(requestManagedGroups),
    enabled,
  });

export const useCreateGroupMutation = (): UseMutationResult<CreatedGroup, Error, GroupForm> =>
  useApiMutation({
    request: requestGroupCreation,
    changes: ['group'],
    notice: { success: (form) => toGroupCreatedMessage(form.name) },
  });

export const useRestoreGroupMutation = (): UseMutationResult<void, Error, GroupMutationInput> =>
  useApiMutation({
    request: (input: GroupMutationInput, accessToken) =>
      requestGroupRestoration(input.groupId, accessToken),
    changes: ['group'],
    notice: { success: (input) => toGroupRestoredMessage(input.name) },
  });

export const useCreateGroupKindMutation = (): UseMutationResult<
  CreatedGroupKind,
  Error,
  GroupKindForm
> =>
  useApiMutation({
    request: requestGroupKindCreation,
    changes: ['groupKind'],
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
    changes: ['groupKind'],
    notice: { success: (input) => toGroupKindSavedMessage(input.form.name) },
  });

export const useArchiveGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> =>
  useApiMutation({
    request: (_input: GroupKindNameInput, accessToken) =>
      requestGroupKindArchival(groupKindId, accessToken),
    changes: ['groupKind'],
    notice: { success: (input) => toGroupKindArchivedMessage(input.kindName) },
  });

export const useRestoreGroupKindMutation = (
  groupKindId: number,
): UseMutationResult<void, Error, GroupKindNameInput> =>
  useApiMutation({
    request: (_input: GroupKindNameInput, accessToken) =>
      requestGroupKindRestoration(groupKindId, accessToken),
    changes: ['groupKind'],
    notice: { success: (input) => toGroupKindRestoredMessage(input.kindName) },
  });
