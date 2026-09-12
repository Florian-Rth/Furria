import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { ROLES_QUERY_KEY, roleQueryKey, useSetRolePermissionsMutation } from '../api';
import type { RolePermissionEntry } from '../manage-roles-labels';
import { toNextPermissionKeys, toPermissionEntries, toRoleSeed } from '../manage-roles-labels';
import type { RoleDetails, RolesResponse } from '../schemas';

const dropOnce = (keys: readonly PermissionKey[], key: PermissionKey): PermissionKey[] => {
  const index = keys.indexOf(key);

  return index === -1 ? [...keys] : [...keys.slice(0, index), ...keys.slice(index + 1)];
};

export interface RolePermissionsControl {
  entries: readonly RolePermissionEntry[];
  toggle: (key: PermissionKey, enabled: boolean) => void;
  isBusy: (key: PermissionKey) => boolean;
}

export const useRolePermissions = (
  role: RoleDetails,
  catalogue: readonly string[],
): RolePermissionsControl => {
  const queryClient = useQueryClient();
  const [busyKeys, setBusyKeys] = useState<readonly PermissionKey[]>([]);
  const mutation = useSetRolePermissionsMutation(role.roleId);

  const readCurrentKeys = (): readonly string[] => {
    const cached = queryClient.getQueryData<RoleDetails>(roleQueryKey(role.roleId));

    if (cached !== undefined) {
      return cached.permissionKeys;
    }

    const seed = toRoleSeed(queryClient.getQueryData<RolesResponse>(ROLES_QUERY_KEY), role.roleId);

    return seed?.permissionKeys ?? role.permissionKeys;
  };

  const toggle = (key: PermissionKey, enabled: boolean): void => {
    const permissionKeys = toNextPermissionKeys(readCurrentKeys(), key, enabled);

    setBusyKeys((keys) => [...keys, key]);
    mutation.mutate(
      { key, enabled, permissionKeys },
      {
        onSettled: () => {
          setBusyKeys((keys) => dropOnce(keys, key));
        },
      },
    );
  };

  return {
    entries: toPermissionEntries(catalogue, role.permissionKeys),
    toggle,
    isBusy: (key) => busyKeys.includes(key),
  };
};
