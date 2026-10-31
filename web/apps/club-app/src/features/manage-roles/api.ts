import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import type { PermissionKey } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import {
  toHolderAddedMessage,
  toHoldingCorrectedMessage,
  toHoldingEndedMessage,
  toPermissionSavedMessage,
  toRoleArchivedMessage,
  toRoleCreatedMessage,
  toRoleRestoredMessage,
  toRoleSavedMessage,
  toRoleSeed,
} from './manage-roles-labels';
import {
  requestAddRoleHolding,
  requestArchiveRole,
  requestCorrectRoleHolding,
  requestCreateRole,
  requestEndRoleHolding,
  requestRestoreRole,
  requestRole,
  requestRoles,
  requestSetRolePermissions,
  requestUpdateRole,
} from './requests';
import { toPermissionCopy } from './role-permission-copy';
import type {
  CreatedRole,
  CreatedRoleHolding,
  RoleDetails,
  RoleForm,
  RolesResponse,
} from './schemas';

export interface RoleNameInput {
  roleName: string;
}

export interface SetRolePermissionsInput {
  key: PermissionKey;
  enabled: boolean;
  permissionKeys: readonly string[];
}

export interface AddRoleHoldingInput {
  personId: number;
  personName: string;
  sinceOn: string;
}

export interface EndRoleHoldingInput {
  roleHoldingId: number;
  personName: string;
  endedOn: string;
}

export interface CorrectRoleHoldingInput {
  roleHoldingId: number;
  personName: string;
  sinceOn: string;
  untilOn: string | null;
}

const applyRolePermissions = (
  current: RoleDetails | undefined,
  permissionKeys: readonly string[],
): RoleDetails | undefined =>
  current === undefined ? undefined : { ...current, permissionKeys: [...permissionKeys] };

const applyListPermissions = (
  current: RolesResponse | undefined,
  roleId: number,
  permissionKeys: readonly string[],
): RolesResponse | undefined => {
  if (current === undefined) {
    return undefined;
  }

  return {
    ...current,
    roles: current.roles.map((role) =>
      role.roleId === roleId ? { ...role, permissionKeys: [...permissionKeys] } : role,
    ),
  };
};

export const useRolesQuery = (enabled = true): UseQueryResult<RolesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => withFreshAccessToken(requestRoles),
    enabled,
  });

export const useRoleQuery = (roleId: number | null): UseQueryResult<RoleDetails, Error> => {
  const queryClient = useQueryClient();

  const load =
    roleId === null
      ? skipToken
      : (): Promise<RoleDetails> =>
          withFreshAccessToken((accessToken) => requestRole(roleId, accessToken));

  return useQuery({
    queryKey: queryKeys.role(roleId),
    queryFn: load,
    placeholderData: () =>
      toRoleSeed(queryClient.getQueryData<RolesResponse>(queryKeys.roles), roleId),
  });
};

export const useCreateRoleMutation = (): UseMutationResult<CreatedRole, Error, RoleForm> =>
  useApiMutation({
    request: requestCreateRole,
    changes: ['role'],
    notice: { success: (form) => toRoleCreatedMessage(form.name) },
  });

export const useUpdateRoleMutation = (roleId: number): UseMutationResult<void, Error, RoleForm> =>
  useApiMutation({
    request: (form: RoleForm, accessToken) => requestUpdateRole(roleId, form, accessToken),
    changes: ['role'],
    notice: { success: (form) => toRoleSavedMessage(form.name) },
  });

export const useArchiveRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> =>
  useApiMutation({
    request: (_input: RoleNameInput, accessToken) => requestArchiveRole(roleId, accessToken),
    changes: ['role'],
    notice: { success: (input) => toRoleArchivedMessage(input.roleName) },
  });

export const useRestoreRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> =>
  useApiMutation({
    request: (_input: RoleNameInput, accessToken) => requestRestoreRole(roleId, accessToken),
    changes: ['role'],
    notice: { success: (input) => toRoleRestoredMessage(input.roleName) },
  });

export const useSetRolePermissionsMutation = (
  roleId: number,
): UseMutationResult<void, Error, SetRolePermissionsInput> =>
  useApiMutation({
    request: (input: SetRolePermissionsInput, accessToken) =>
      requestSetRolePermissions(roleId, input.permissionKeys, accessToken),
    optimistic: [
      optimisticPatch(queryKeys.role(roleId), (current: RoleDetails | undefined, input) =>
        applyRolePermissions(current, input.permissionKeys),
      ),
      optimisticPatch(queryKeys.roles, (current: RolesResponse | undefined, input) =>
        applyListPermissions(current, roleId, input.permissionKeys),
      ),
    ],
    changes: ['role'],
    key: ['role-permissions', roleId],
    notice: {
      success: (input) =>
        toPermissionSavedMessage(toPermissionCopy(input.key).title, input.enabled),
    },
  });

export const useAddRoleHoldingMutation = (
  roleId: number,
  roleName: string,
): UseMutationResult<CreatedRoleHolding, Error, AddRoleHoldingInput> =>
  useApiMutation({
    request: (input: AddRoleHoldingInput, accessToken) =>
      requestAddRoleHolding(
        roleId,
        { personId: input.personId, sinceOn: input.sinceOn },
        accessToken,
      ),
    changes: ['roleHolding'],
    notice: {
      success: (input) =>
        toHolderAddedMessage(input.personName, roleName, input.sinceOn, toIsoDay(new Date())),
    },
  });

export const useEndRoleHoldingMutation = (
  roleId: number,
): UseMutationResult<void, Error, EndRoleHoldingInput> =>
  useApiMutation({
    request: (input: EndRoleHoldingInput, accessToken) =>
      requestEndRoleHolding(
        roleId,
        { roleHoldingId: input.roleHoldingId, endedOn: input.endedOn },
        accessToken,
      ),
    changes: ['roleHolding'],
    notice: {
      success: (input) =>
        toHoldingEndedMessage(input.personName, input.endedOn, toIsoDay(new Date())),
    },
  });

export const useCorrectRoleHoldingMutation = (
  roleId: number,
): UseMutationResult<void, Error, CorrectRoleHoldingInput> =>
  useApiMutation({
    request: (input: CorrectRoleHoldingInput, accessToken) =>
      requestCorrectRoleHolding(
        roleId,
        { roleHoldingId: input.roleHoldingId, sinceOn: input.sinceOn, untilOn: input.untilOn },
        accessToken,
      ),
    changes: ['roleHolding'],
    notice: { success: (input) => toHoldingCorrectedMessage(input.personName) },
  });
