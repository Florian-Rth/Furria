import type { GroupHub } from './schemas';

export interface HubActsAccess {
  sees: boolean;
  manages: boolean;
}

export const toHubActsAccess = (hub: GroupHub, plansRunningOrder: boolean): HubActsAccess => {
  const manages = hub.viewerIsAdmin || plansRunningOrder;

  return { sees: manages || hub.viewerIsMember, manages };
};
