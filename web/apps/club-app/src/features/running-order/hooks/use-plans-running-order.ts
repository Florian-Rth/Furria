import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export const usePlansRunningOrder = (): boolean => {
  const permissions = usePermissions();

  return (
    permissions.has(PERMISSION_KEYS.eventsRunningOrder) ||
    permissions.has(PERMISSION_KEYS.eventsManage)
  );
};
