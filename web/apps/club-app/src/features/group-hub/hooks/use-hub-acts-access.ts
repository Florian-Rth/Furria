import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import type { HubActsAccess } from '../hub-acts-access';
import { toHubActsAccess } from '../hub-acts-access';
import type { GroupHub } from '../schemas';

export const useHubActsAccess = (hub: GroupHub): HubActsAccess =>
  toHubActsAccess(hub, usePlansRunningOrder());
