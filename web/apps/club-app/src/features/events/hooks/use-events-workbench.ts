import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface EventsWorkbenchKeys {
  isUndecided: boolean;
  managesEvents: boolean;
  handlesRequests: boolean;
}

export const useEventsWorkbench = (): EventsWorkbenchKeys => {
  const permissions = usePermissions();

  return {
    isUndecided: permissions.isUndecided,
    managesEvents: permissions.has(PERMISSION_KEYS.eventsManage),
    handlesRequests: permissions.has(PERMISSION_KEYS.ticketRequestsHandle),
  };
};
