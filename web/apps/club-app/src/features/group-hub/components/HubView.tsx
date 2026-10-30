import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import { GroupHistoryPanel } from '@/features/group-detail/components/GroupHistoryPanel';
import { toHeldGroupKind } from '@/features/group-kinds/group-kinds-labels';
import { toGroupTone } from '@/features/groups/group-identity';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { useLanding } from '@/features/write/hooks/use-landing';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useHubActsAccess } from '../hooks/use-hub-acts-access';
import { toHubPeople } from '../hub-people';
import type { GroupHub } from '../schemas';
import { HubActsPanel } from './HubActsPanel';
import { HubAdministrationPanel } from './HubAdministrationPanel';
import { HubCalendarEntriesPanel } from './HubCalendarEntriesPanel';
import { HubCarePanel } from './HubCarePanel';
import { HubDescriptionPanel } from './HubDescriptionPanel';
import { HubPeoplePanel } from './HubPeoplePanel';
import { HubRhythmPanel } from './HubRhythmPanel';

const HISTORY_META = 'nur für die Verwaltung dieser Gruppe';

interface HubViewProps {
  hub: GroupHub;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const permissions = usePermissions();
  const actsAccess = useHubActsAccess(hub);
  const { highlightedKey } = useLanding();
  const tone = toGroupTone(hub.groupId, hub.tone);
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);
  const people = toHubPeople(hub.members, hub.admins);

  const seesCalendarEntries = hub.viewerIsMember || hub.viewerMayManage;
  const calendarEntries = seesCalendarEntries ? (
    <HubCalendarEntriesPanel groupId={hub.groupId} tone={tone} />
  ) : null;

  const care = hub.viewerMayManage ? (
    <HubCarePanel hub={hub} tone={tone} heldKind={heldKind} />
  ) : null;

  const history = hub.viewerMayManage ? (
    <GroupHistoryPanel
      pastMembers={hub.pastMembers}
      pastAdmins={hub.pastAdmins}
      meta={HISTORY_META}
      groupTone={tone}
    />
  ) : null;

  const acts = actsAccess.sees ? (
    <HubActsPanel groupId={hub.groupId} tone={tone} canManage={actsAccess.manages} />
  ) : null;

  const administration = permissions.has(PERMISSION_KEYS.groupsManage) ? (
    <HubAdministrationPanel hub={hub} tone={tone} />
  ) : null;

  return (
    <KkPanelStack>
      {acts}
      <HubDescriptionPanel tone={tone} groupName={hub.name} description={hub.description} />
      <HubPeoplePanel
        tone={tone}
        people={people}
        groupId={hub.groupId}
        groupName={hub.name}
        canManage={hub.viewerMayManage}
        highlightedKey={highlightedKey}
      />
      {calendarEntries}
      <HubRhythmPanel
        groupId={hub.groupId}
        tone={tone}
        slots={hub.trainingSlots}
        canManage={hub.viewerMayManage}
      />
      {care}
      {history}
      {administration}
    </KkPanelStack>
  );
};
