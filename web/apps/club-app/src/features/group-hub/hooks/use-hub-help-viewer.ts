import type { GroupTone } from '@/features/groups/group-identity';
import { toGroupTone } from '@/features/groups/group-identity';
import { mayStartIntakeForGroup } from '@/features/manage-intakes/intake-rules';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toHubActsAccess } from '../hub-acts-access';
import type { GroupHub } from '../schemas';

export interface HubHelpViewer {
  tone: GroupTone;
  manages: boolean;
  seesCalendar: boolean;
  seesActs: boolean;
  managesActs: boolean;
  startsIntakes: boolean;
  seesHistory: boolean;
}

export const useHubHelpViewer = (hub: GroupHub | undefined): HubHelpViewer | undefined => {
  const permissions = usePermissions();
  const plansRunningOrder = usePlansRunningOrder();

  if (hub === undefined) {
    return undefined;
  }

  const actsAccess = toHubActsAccess(hub, plansRunningOrder);
  const hasHistory = hub.pastMembers.length > 0 || hub.pastAdmins.length > 0;

  return {
    tone: toGroupTone(hub.groupId, hub.tone),
    manages: hub.viewerMayManage,
    seesCalendar: hub.viewerIsMember || hub.viewerMayManage,
    seesActs: actsAccess.sees,
    managesActs: actsAccess.manages,
    startsIntakes: mayStartIntakeForGroup(
      hub.viewerIsAdmin,
      permissions.has(PERMISSION_KEYS.personsManage),
    ),
    seesHistory: hub.viewerMayManage && hasHistory,
  };
};
