import { KkPanelStack, useKkSheetCommands } from '@furria/ui';
import type { FC } from 'react';
import { GroupHistoryPanel } from '@/features/group-detail';
import { toHeldGroupKind } from '@/features/group-kinds';
import { toGroupTone } from '@/features/groups';
import { usePermissions, useReturnFocus } from '@/features/session';
import { useGroupInfoForm } from '../hooks/use-group-info-form';
import { useHubCelebration } from '../hooks/use-hub-celebration';
import { useHubDialogs } from '../hooks/use-hub-dialogs';
import { useTakenTones } from '../hooks/use-taken-tones';
import { toHubPeople } from '../hub-people';
import type { GroupHub } from '../schemas';
import { AddMemberDialog } from './AddMemberDialog';
import { EndAdminDialog } from './EndAdminDialog';
import { EndMembershipDialog } from './EndMembershipDialog';
import { HubCarePanel } from './HubCarePanel';
import { HubDescriptionPanel } from './HubDescriptionPanel';
import { HubPeekSheet } from './HubPeekSheet';
import { HubPeoplePanel } from './HubPeoplePanel';
import { HubRhythmPanel } from './HubRhythmPanel';
import { HubTerminePanel } from './HubTerminePanel';
import { PromoteAdminDialog } from './PromoteAdminDialog';

const HISTORY_META = 'nur für die Verwaltung dieser Gruppe';

interface HubViewProps {
  hub: GroupHub;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const dialogs = useHubDialogs(hub.members, hub.admins);
  const celebration = useHubCelebration();
  const { isAffiliated } = usePermissions();
  const peopleFocus = useReturnFocus();
  const careFocus = useReturnFocus();
  const sheet = useKkSheetCommands();
  const tone = toGroupTone(hub.groupId, hub.tone);
  const takenTones = useTakenTones(hub.groupId, hub.viewerMayManage);
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);
  const people = toHubPeople(hub.members, hub.admins);

  const form = useGroupInfoForm({
    groupId: hub.groupId,
    description: hub.description,
    isRecruiting: hub.isRecruiting,
    groupKindId: hub.groupKindId,
    foundedYear: hub.foundedYear,
    tone: hub.tone,
  });

  const endMembershipFromPeek = (groupMembershipId: number): void => {
    sheet.close();
    dialogs.openEndMembership(groupMembershipId);
  };

  const endAdminFromPeek = (groupAdminId: number): void => {
    sheet.close();
    dialogs.openEndAdmin(groupAdminId);
  };

  const startCare = (): void => {
    form.start();
    careFocus.returnFocus();
  };

  const closeAfterPersonEnded = (): void => {
    dialogs.close();
    peopleFocus.returnFocus();
  };

  const onMemberAdded = (personId: number): void => {
    dialogs.close();
    celebration.celebrateMember(personId);
  };

  const promoteFromPeek = (personId: number): void => {
    sheet.close();
    dialogs.openPromote(personId);
  };

  const closeAfterPromotion = (): void => {
    dialogs.close();
    peopleFocus.returnFocus();
  };

  const seesTermine = hub.viewerIsMember || hub.viewerMayManage;
  const termine = seesTermine ? <HubTerminePanel groupId={hub.groupId} tone={tone} /> : null;

  const care = hub.viewerMayManage ? (
    <HubCarePanel
      tone={tone}
      form={form}
      heldKind={heldKind}
      takenTones={takenTones}
      titleRef={careFocus.targetRef}
    />
  ) : null;

  const history = hub.viewerMayManage ? (
    <GroupHistoryPanel
      pastMembers={hub.pastMembers}
      pastAdmins={hub.pastAdmins}
      meta={HISTORY_META}
      groupTone={tone}
    />
  ) : null;

  const tools = hub.viewerMayManage ? (
    <>
      <AddMemberDialog
        groupId={hub.groupId}
        groupName={hub.name}
        open={dialogs.isAddMemberOpen}
        onClose={dialogs.close}
        onAdded={onMemberAdded}
      />
      <EndMembershipDialog
        groupId={hub.groupId}
        groupName={hub.name}
        member={dialogs.endMember}
        onClose={dialogs.close}
        onEnded={closeAfterPersonEnded}
      />
      <PromoteAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        member={dialogs.promoteMember}
        onClose={dialogs.close}
        onAppointed={closeAfterPromotion}
      />
      <EndAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        admin={dialogs.endAdmin}
        runningAdmins={hub.admins.length}
        onClose={dialogs.close}
        onEnded={closeAfterPersonEnded}
      />
    </>
  ) : null;

  return (
    <>
      <KkPanelStack>
        <HubDescriptionPanel
          tone={tone}
          groupName={hub.name}
          description={hub.description}
          canManage={hub.viewerMayManage}
          onEdit={startCare}
        />
        <HubPeoplePanel
          tone={tone}
          people={people}
          groupName={hub.name}
          canManage={hub.viewerMayManage}
          viewerIsAffiliated={isAffiliated}
          newPersonId={celebration.newMemberId}
          fireKey={celebration.fireKey}
          titleRef={peopleFocus.targetRef}
          onAddMember={dialogs.openAddMember}
        />
        {termine}
        <HubRhythmPanel
          groupId={hub.groupId}
          groupName={hub.name}
          tone={tone}
          slots={hub.trainingSlots}
          canManage={hub.viewerMayManage}
        />
        {care}
        {history}
      </KkPanelStack>
      <HubPeekSheet
        tone={tone}
        people={people}
        canManage={hub.viewerMayManage}
        onPromote={promoteFromPeek}
        onEndMembership={endMembershipFromPeek}
        onEndAdmin={endAdminFromPeek}
      />
      {tools}
    </>
  );
};
