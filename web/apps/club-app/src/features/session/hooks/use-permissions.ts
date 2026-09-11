import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useMeQuery } from '../api';

export interface Permissions {
  keys: readonly PermissionKey[];
  has: (key: PermissionKey) => boolean;
  isAffiliated: boolean;
  isPending: boolean;
}

const KNOWN_KEYS: readonly PermissionKey[] = Object.values(PERMISSION_KEYS);
const NO_KEYS: readonly PermissionKey[] = [];

const isPermissionKey = (value: string): value is PermissionKey =>
  KNOWN_KEYS.some((known) => known === value);

export const usePermissions = (): Permissions => {
  const me = useMeQuery();
  const keys = me.data === undefined ? NO_KEYS : me.data.permissionKeys.filter(isPermissionKey);

  return {
    keys,
    has: (key) => keys.includes(key),
    isAffiliated: me.data?.isAffiliated ?? false,
    isPending: me.data === undefined,
  };
};
