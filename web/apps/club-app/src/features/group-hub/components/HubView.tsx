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
import { HubCalendarEntriesPanel } from './HubCalendarEntriesPanel';
import { HubDescriptionLead } from './HubDescriptionLead';
import { HubPeoplePanel } from './HubPeoplePanel';
import { HubSettingsPanel } from './HubSettingsPanel';
import { HubUsualTrainingTimesPanel } from './HubUsualTrainingTimesPanel';

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
  const administers = permissions.has(PERMISSION_KEYS.groupsManage);
  const seesCalendarEntries = hub.viewerIsMember || hub.viewerMayManage;
  const hasHistory = hub.pastMembers.length > 0 || hub.pastAdmins.length > 0;

  const acts = actsAccess.sees ? (
    <HubActsPanel groupId={hub.groupId} tone={tone} canManage={actsAccess.manages} />
  ) : null;

  const calendarEntries = seesCalendarEntries ? (
    <HubCalendarEntriesPanel
      groupId={hub.groupId}
      tone={tone}
      usualTimes={hub.usualTrainingTimes}
      canPlan={hub.viewerMayManage}
    />
  ) : null;

  const history =
    hub.viewerMayManage && hasHistory ? (
      <GroupHistoryPanel
        pastMembers={hub.pastMembers}
        pastAdmins={hub.pastAdmins}
        groupTone={tone}
      />
    ) : null;

  const settings =
    hub.viewerMayManage || administers ? (
      <HubSettingsPanel hub={hub} tone={tone} heldKind={heldKind} administers={administers} />
    ) : null;

  return (
    <KkPanelStack>
      <HubDescriptionLead description={hub.description} />
      {acts}
      {calendarEntries}
      <HubUsualTrainingTimesPanel
        groupId={hub.groupId}
        tone={tone}
        usualTimes={hub.usualTrainingTimes}
        canManage={hub.viewerMayManage}
      />
      <HubPeoplePanel
        tone={tone}
        people={people}
        groupId={hub.groupId}
        groupName={hub.name}
        canManage={hub.viewerMayManage}
        highlightedKey={highlightedKey}
      />
      {history}
      {settings}
    </KkPanelStack>
  );
};
