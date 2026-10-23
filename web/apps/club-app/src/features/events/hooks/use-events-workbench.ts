import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface EventsWorkbenchKeys {
  isUndecided: boolean;
  managesEvents: boolean;
  handlesRequests: boolean;
  plansRunningOrder: boolean;
}

export const useEventsWorkbench = (): EventsWorkbenchKeys => {
  const permissions = usePermissions();

  return {
    isUndecided: permissions.isUndecided,
    managesEvents: permissions.has(PERMISSION_KEYS.eventsManage),
    handlesRequests: permissions.has(PERMISSION_KEYS.ticketRequestsHandle),
    plansRunningOrder:
      permissions.has(PERMISSION_KEYS.eventsRunningOrder) ||
      permissions.has(PERMISSION_KEYS.eventsManage),
  };
};
