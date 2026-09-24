import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { GroupHistoryPanel } from '@/features/group-detail';
import { toHeldGroupKind } from '@/features/group-kinds';
import { toGroupTone } from '@/features/groups';
import { usePermissions } from '@/features/session';
import { useLanding } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toHubPeople } from '../hub-people';
import type { GroupHub } from '../schemas';
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

  const administration = permissions.has(PERMISSION_KEYS.groupsManage) ? (
    <HubAdministrationPanel hub={hub} tone={tone} />
  ) : null;

  return (
    <KkPanelStack>
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
