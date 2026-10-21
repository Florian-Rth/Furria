import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useMeQuery } from '@/features/session';
import type { PermissionKey } from '@/lib/api/schemas';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useSetRolePermissionsMutation } from '../api';
import type { RolePermissionEntry } from '../manage-roles-labels';
import {
  isPermissionHandover,
  isSelfLockout,
  toNextPermissionKeys,
  toPermissionEntries,
  toRoleSeed,
} from '../manage-roles-labels';
import type { RoleDetails, RoleSummary, RolesResponse } from '../schemas';

type EditedRole = Pick<RoleSummary, 'roleId' | 'permissionKeys'>;

const NO_ROLES: readonly RoleSummary[] = [];

const dropOnce = (keys: readonly PermissionKey[], key: PermissionKey): PermissionKey[] => {
  const index = keys.indexOf(key);

  return index === -1 ? [...keys] : [...keys.slice(0, index), ...keys.slice(index + 1)];
};

interface PermissionRejection {
  key: PermissionKey;
  message: string;
}

const without = (
  rejections: readonly PermissionRejection[],
  key: PermissionKey,
): PermissionRejection[] => rejections.filter((rejection) => rejection.key !== key);

export interface RolePermissionsControl {
  entries: readonly RolePermissionEntry[];
  toggle: (key: PermissionKey, enabled: boolean) => void;
  isBusy: (key: PermissionKey) => boolean;
  errorOf: (key: PermissionKey) => string | undefined;
  selfLockout: RolePermissionEntry | null;
  confirmSelfLockout: () => void;
  cancelSelfLockout: () => void;
  permissionHandover: RolePermissionEntry | null;
  confirmPermissionHandover: () => void;
  cancelPermissionHandover: () => void;
}

export const useRolePermissions = (
  role: EditedRole,
  catalogue: readonly string[],
): RolePermissionsControl => {
  const queryClient = useQueryClient();
  const me = useMeQuery();
  const [busyKeys, setBusyKeys] = useState<readonly PermissionKey[]>([]);
  const [rejections, setRejections] = useState<readonly PermissionRejection[]>([]);
  const [lockoutKey, setLockoutKey] = useState<PermissionKey | null>(null);
  const [handoverKey, setHandoverKey] = useState<PermissionKey | null>(null);
  const mutation = useSetRolePermissionsMutation(role.roleId);

  const entries = toPermissionEntries(catalogue, role.permissionKeys);
  const viewerPersonId = me.data?.person?.id;

  const readRoles = (): readonly RoleSummary[] =>
    queryClient.getQueryData<RolesResponse>(queryKeys.roles)?.roles ?? NO_ROLES;

  const readCurrentKeys = (): readonly string[] => {
    const cached = queryClient.getQueryData<RoleDetails>(queryKeys.role(role.roleId));

    if (cached !== undefined) {
      return cached.permissionKeys;
    }

    const seed = toRoleSeed(queryClient.getQueryData<RolesResponse>(queryKeys.roles), role.roleId);

    return seed?.permissionKeys ?? role.permissionKeys;
  };

  const apply = (key: PermissionKey, enabled: boolean): void => {
    const permissionKeys = toNextPermissionKeys(readCurrentKeys(), key, enabled);

    setBusyKeys((keys) => [...keys, key]);
    setRejections((current) => without(current, key));
    void mutation
      .mutateAsync({ key, enabled, permissionKeys })
      .then(
        () => undefined,
        (error: Error) => {
          const message = toWriteErrorMessage(error);

          if (message !== null) {
            setRejections((current) => [...without(current, key), { key, message }]);
          }
        },
      )
      .finally(() => {
        setBusyKeys((keys) => dropOnce(keys, key));
      });
  };

  const toggle = (key: PermissionKey, enabled: boolean): void => {
    if (
      isSelfLockout({
        key,
        enabled,
        roleId: role.roleId,
        viewerPersonId,
        roles: readRoles(),
      })
    ) {
      setLockoutKey(key);
      return;
    }
    if (isPermissionHandover({ key, enabled })) {
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

  const cancelPermissionHandover = (): void => {
    setHandoverKey(null);
  };

  const confirmPermissionHandover = (): void => {
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
    errorOf: (key) => rejections.find((rejection) => rejection.key === key)?.message,
    selfLockout: entries.find((entry) => entry.key === lockoutKey) ?? null,
    confirmSelfLockout,
    cancelSelfLockout,
    permissionHandover: entries.find((entry) => entry.key === handoverKey) ?? null,
    confirmPermissionHandover,
    cancelPermissionHandover,
  };
};
