import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useMeQuery, usePermissions } from '@/features/session';
import type { PermissionKey } from '@/lib/api/schemas';
import { ROLES_QUERY_KEY, roleQueryKey, useSetRolePermissionsMutation } from '../api';
import type { RolePermissionEntry } from '../manage-roles-labels';
import {
  isKeyHandover,
  isSelfLockout,
  toNextPermissionKeys,
  toPermissionEntries,
  toRoleSeed,
} from '../manage-roles-labels';
import type { RoleDetails, RolesResponse } from '../schemas';

const dropOnce = (keys: readonly PermissionKey[], key: PermissionKey): PermissionKey[] => {
  const index = keys.indexOf(key);

  return index === -1 ? [...keys] : [...keys.slice(0, index), ...keys.slice(index + 1)];
};

export interface RolePermissionsControl {
  entries: readonly RolePermissionEntry[];
  toggle: (key: PermissionKey, enabled: boolean) => void;
  isBusy: (key: PermissionKey) => boolean;
  selfLockout: RolePermissionEntry | null;
  confirmSelfLockout: () => void;
  cancelSelfLockout: () => void;
  keyHandover: RolePermissionEntry | null;
  confirmKeyHandover: () => void;
  cancelKeyHandover: () => void;
}

export const useRolePermissions = (
  role: RoleDetails,
  catalogue: readonly string[],
): RolePermissionsControl => {
  const queryClient = useQueryClient();
  const me = useMeQuery();
  const permissions = usePermissions();
  const [busyKeys, setBusyKeys] = useState<readonly PermissionKey[]>([]);
  const [lockoutKey, setLockoutKey] = useState<PermissionKey | null>(null);
  const [handoverKey, setHandoverKey] = useState<PermissionKey | null>(null);
  const mutation = useSetRolePermissionsMutation(role.roleId);

  const entries = toPermissionEntries(catalogue, role.permissionKeys);
  const viewerPersonId = me.data?.person.id;
  const viewerIsHolder =
    viewerPersonId !== undefined &&
    role.holders.some((holder) => holder.personId === viewerPersonId);

  const readCurrentKeys = (): readonly string[] => {
    const cached = queryClient.getQueryData<RoleDetails>(roleQueryKey(role.roleId));

    if (cached !== undefined) {
      return cached.permissionKeys;
    }

    const seed = toRoleSeed(queryClient.getQueryData<RolesResponse>(ROLES_QUERY_KEY), role.roleId);

    return seed?.permissionKeys ?? role.permissionKeys;
  };

  const apply = (key: PermissionKey, enabled: boolean): void => {
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

  const toggle = (key: PermissionKey, enabled: boolean): void => {
    if (isSelfLockout({ enabled, viewerIsHolder, viewerHasKey: permissions.has(key) })) {
      setLockoutKey(key);
      return;
    }
    if (isKeyHandover({ key, enabled })) {
      setHandoverKey(key);
      return;
    }

    apply(key, enabled);
  };

  const cancelSelfLockout = (): void => {
    setLockoutKey(null);
  };

  const confirmSelfLockout = (): void => {
    if (lockoutKey === null) {
      return;
    }

    apply(lockoutKey, false);
    setLockoutKey(null);
  };

  const cancelKeyHandover = (): void => {
    setHandoverKey(null);
  };

  const confirmKeyHandover = (): void => {
    if (handoverKey === null) {
      return;
    }

    apply(handoverKey, true);
    setHandoverKey(null);
  };

  return {
    entries,
    toggle,
    isBusy: (key) => busyKeys.includes(key),
    selfLockout: entries.find((entry) => entry.key === lockoutKey) ?? null,
    confirmSelfLockout,
    cancelSelfLockout,
    keyHandover: entries.find((entry) => entry.key === handoverKey) ?? null,
    confirmKeyHandover,
    cancelKeyHandover,
  };
};
