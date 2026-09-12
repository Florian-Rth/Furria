import { useKkToast } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PermissionKey } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toIsoDay } from '@/lib/day';
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
import { toWriteErrorMessage } from './manage-roles-messages';
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

export const ROLES_QUERY_KEY = ['manage', 'roles'] as const;

export const roleQueryKey = (roleId: number | null): readonly [string, string, number | null] => [
  'manage',
  'roles',
  roleId,
];

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

const refreshRoles = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
};

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
    queryKey: ROLES_QUERY_KEY,
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
    queryKey: roleQueryKey(roleId),
    queryFn: load,
    placeholderData: () =>
      toRoleSeed(queryClient.getQueryData<RolesResponse>(ROLES_QUERY_KEY), roleId),
  });
};

export const useCreateRoleMutation = (): UseMutationResult<CreatedRole, Error, RoleForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: RoleForm) =>
      withFreshAccessToken((accessToken) => requestCreateRole(form, accessToken)),
    onSuccess: (_created, form) => {
      showToast({ tone: 'success', message: toRoleCreatedMessage(form.name) });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useUpdateRoleMutation = (roleId: number): UseMutationResult<void, Error, RoleForm> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (form: RoleForm) =>
      withFreshAccessToken((accessToken) => requestUpdateRole(roleId, form, accessToken)),
    onSuccess: (_result, form) => {
      showToast({ tone: 'success', message: toRoleSavedMessage(form.name) });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useArchiveRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestArchiveRole(roleId, accessToken)),
    onSuccess: (_result, input) => {
      showToast({ tone: 'success', message: toRoleArchivedMessage(input.roleName) });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useRestoreRoleMutation = (
  roleId: number,
): UseMutationResult<void, Error, RoleNameInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestRestoreRole(roleId, accessToken)),
    onSuccess: (_result, input) => {
      showToast({ tone: 'success', message: toRoleRestoredMessage(input.roleName) });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useSetRolePermissionsMutation = (
  roleId: number,
): UseMutationResult<void, Error, SetRolePermissionsInput, RolePermissionsRollback> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
    mutationFn: (input: SetRolePermissionsInput) =>
      withFreshAccessToken((accessToken) =>
        requestSetRolePermissions(roleId, input.permissionKeys, accessToken),
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ROLES_QUERY_KEY });
      const role = queryClient.getQueryData<RoleDetails>(roleQueryKey(roleId));
      const roles = queryClient.getQueryData<RolesResponse>(ROLES_QUERY_KEY);

      queryClient.setQueryData<RoleDetails>(roleQueryKey(roleId), (current) =>
        applyRolePermissions(current, input.permissionKeys),
      );
      queryClient.setQueryData<RolesResponse>(ROLES_QUERY_KEY, (current) =>
        applyListPermissions(current, roleId, input.permissionKeys),
      );

      return { role, roles };
    },
    onSuccess: (_result, input) => {
      const message = toPermissionSavedMessage(toPermissionCopy(input.key).title, input.enabled);

      showToast({ tone: 'success', message });
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(roleQueryKey(roleId), context?.role);
      queryClient.setQueryData(ROLES_QUERY_KEY, context?.roles);
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        showToast({ tone: 'error', message });
      }
    },
    onSettled: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useAddRoleHoldingMutation = (
  roleId: number,
  roleName: string,
): UseMutationResult<CreatedRoleHolding, Error, AddRoleHoldingInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
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

      showToast({ tone: 'success', message });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};

export const useEndRoleHoldingMutation = (
  roleId: number,
): UseMutationResult<void, Error, EndRoleHoldingInput> => {
  const queryClient = useQueryClient();
  const showToast = useKkToast();

  return useMutation({
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

      showToast({ tone: 'success', message });
      refreshRoles(queryClient);
    },
    onError: () => {
      refreshRoles(queryClient);
    },
  });
};
