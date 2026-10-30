import { usePermissions } from '@/features/session/hooks/use-permissions';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export const PLANNER_PERMISSION_KEYS: readonly PermissionKey[] = [
  PERMISSION_KEYS.eventsRunningOrder,
  PERMISSION_KEYS.eventsManage,
];

export const usePlansRunningOrder = (): boolean => {
  const permissions = usePermissions();

  return PLANNER_PERMISSION_KEYS.some((key) => permissions.has(key));
};
