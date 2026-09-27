import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export const PERSON_READ_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [
  PERMISSION_KEYS.personsManage,
  PERMISSION_KEYS.accountsManage,
];
