import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export const HALL_PERMISSION_KEYS: readonly PermissionKey[] = [
  PERMISSION_KEYS.eventsHall,
  PERMISSION_KEYS.eventsManage,
];
