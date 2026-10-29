import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { GroupHub } from '../schemas';

export interface HubActsAccess {
  sees: boolean;
  manages: boolean;
}

export const useHubActsAccess = (hub: GroupHub): HubActsAccess => {
  const plans = usePlansRunningOrder();
  const manages = hub.viewerIsAdmin || plans;

  return { sees: manages || hub.viewerIsMember, manages };
};
