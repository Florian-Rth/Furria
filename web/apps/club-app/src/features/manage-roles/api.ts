import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PermissionKey } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  toHolderAddedMessage,
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

interface RolePermissionsRollback {
  role: RoleDetails | undefined;
  roles: RolesResponse | undefined;
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

export const useRolesQuery = (): UseQueryResult<RolesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => withFreshAccessToken(requestRoles),
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

export const useCreateRoleMutation = (): UseMutationResult<CreatedRole, Error, RoleForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['role'] },
    mutationFn: (form: RoleForm) =>
      withFreshAccessToken((accessToken) => requestCreateRole(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toRoleCreatedMessage(form.name) });
    },
  });
};

export const useUpdateRoleMutation = (roleId: number): UseMutationResult<void, Error, RoleForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['role'] },
    mutationFn: (form: RoleForm) =>
      withFreshAccessToken((accessToken) => requestUpdateRole(roleId, form, accessToken)),
    onSuccess: (_result, form) => {
      raiseNotice({ tone: 'success', message: toRoleSavedMessage(form.name) });
    },
  });
};

export const useArchiveRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['role'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestArchiveRole(roleId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toRoleArchivedMessage(input.roleName) });
    },
  });
};

export const useRestoreRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['role'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestRestoreRole(roleId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toRoleRestoredMessage(input.roleName) });
    },
    onError: (error) => {
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
  });
};

export const useSetRolePermissionsMutation = (
  roleId: number,
): UseMutationResult<void, Error, SetRolePermissionsInput, RolePermissionsRollback> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['role'] },
    mutationFn: (input: SetRolePermissionsInput) =>
      withFreshAccessToken((accessToken) =>
        requestSetRolePermissions(roleId, input.permissionKeys, accessToken),
      ),
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.roles }),
        queryClient.cancelQueries({ queryKey: queryKeys.role(roleId) }),
      ]);
      const role = queryClient.getQueryData<RoleDetails>(queryKeys.role(roleId));
      const roles = queryClient.getQueryData<RolesResponse>(queryKeys.roles);

      queryClient.setQueryData<RoleDetails>(queryKeys.role(roleId), (current) =>
        applyRolePermissions(current, input.permissionKeys),
      );
      queryClient.setQueryData<RolesResponse>(queryKeys.roles, (current) =>
        applyListPermissions(current, roleId, input.permissionKeys),
      );

      return { role, roles };
    },
    onSuccess: (_result, input) => {
      const message = toPermissionSavedMessage(toPermissionCopy(input.key).title, input.enabled);

      raiseNotice({ tone: 'success', message });
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(queryKeys.role(roleId), context?.role);
      queryClient.setQueryData(queryKeys.roles, context?.roles);
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
  });
};

export const useAddRoleHoldingMutation = (
  roleId: number,
  roleName: string,
): UseMutationResult<CreatedRoleHolding, Error, AddRoleHoldingInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['roleHolding'] },
    mutationFn: (input: AddRoleHoldingInput) =>
      withFreshAccessToken((accessToken) =>
        requestAddRoleHolding(
          roleId,
          { personId: input.personId, sinceOn: input.sinceOn },
          accessToken,
        ),
      ),
    onSuccess: (_created, input) => {
      const message = toHolderAddedMessage(
        input.personName,
        roleName,
        input.sinceOn,
        toIsoDay(new Date()),
      );

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useEndRoleHoldingMutation = (
  roleId: number,
): UseMutationResult<void, Error, EndRoleHoldingInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['roleHolding'] },
    mutationFn: (input: EndRoleHoldingInput) =>
      withFreshAccessToken((accessToken) =>
        requestEndRoleHolding(
          roleId,
          { roleHoldingId: input.roleHoldingId, endedOn: input.endedOn },
          accessToken,
        ),
      ),
    onSuccess: (_result, input) => {
      const message = toHoldingEndedMessage(input.personName, input.endedOn, toIsoDay(new Date()));

      raiseNotice({ tone: 'success', message });
    },
  });
};
