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
import type { GroupHub } from '../schemas';
import { AddAdminDialog } from './AddAdminDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { EndAdminDialog } from './EndAdminDialog';
import { EndMembershipDialog } from './EndMembershipDialog';
import { HubAdminsPanel } from './HubAdminsPanel';
import { HubCarePanel } from './HubCarePanel';
import { HubDescriptionPanel } from './HubDescriptionPanel';
import { HubPeekSheet } from './HubPeekSheet';
import { HubRhythmPanel } from './HubRhythmPanel';
import { HubRosterPanel } from './HubRosterPanel';
import { HubTerminePanel } from './HubTerminePanel';

const HISTORY_META = 'nur für Gruppen-Admins';

interface HubViewProps {
  hub: GroupHub;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const dialogs = useHubDialogs(hub.members, hub.admins);
  const celebration = useHubCelebration();
  const { isAffiliated } = usePermissions();
  const membersFocus = useReturnFocus();
  const adminsFocus = useReturnFocus();
  const careFocus = useReturnFocus();
  const sheet = useKkSheetCommands();
  const tone = toGroupTone(hub.groupId, hub.tone);
  const takenTones = useTakenTones(hub.groupId, hub.viewerIsAdmin);
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);

  const form = useGroupInfoForm({
    groupId: hub.groupId,
    description: hub.description,
    isRecruiting: hub.isRecruiting,
    groupKindId: hub.groupKindId,
    foundedYear: hub.foundedYear,
    tone: hub.tone,
  });

  const endFromPeek = (groupMembershipId: number): void => {
    sheet.close();
    dialogs.openEndMembership(groupMembershipId);
  };

  const startCare = (): void => {
    form.start();
    careFocus.returnFocus();
  };

  const closeAfterMemberEnded = (): void => {
    dialogs.close();
    membersFocus.returnFocus();
  };

  const closeAfterAdminEnded = (): void => {
    dialogs.close();
    adminsFocus.returnFocus();
  };

  const onMemberAdded = (personId: number): void => {
    dialogs.close();
    celebration.celebrateMember(personId);
  };

  const onAdminAppointed = (): void => {
    dialogs.close();
  };

  const seesTermine = hub.viewerIsMember || hub.viewerIsAdmin;
  const termine = seesTermine ? <HubTerminePanel groupId={hub.groupId} tone={tone} /> : null;

  const care = hub.viewerIsAdmin ? (
    <HubCarePanel
      tone={tone}
      form={form}
      heldKind={heldKind}
      takenTones={takenTones}
      titleRef={careFocus.targetRef}
    />
  ) : null;

  const history = hub.viewerIsAdmin ? (
    <GroupHistoryPanel
      pastMembers={hub.pastMembers}
      pastAdmins={hub.pastAdmins}
      meta={HISTORY_META}
      groupTone={tone}
    />
  ) : null;

  const tools = hub.viewerIsAdmin ? (
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
        onEnded={closeAfterMemberEnded}
      />
      <AddAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        open={dialogs.isAddAdminOpen}
        onClose={dialogs.close}
        onAppointed={onAdminAppointed}
      />
      <EndAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        admin={dialogs.endAdmin}
        runningAdmins={hub.admins.length}
        onClose={dialogs.close}
        onEnded={closeAfterAdminEnded}
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
          canManage={hub.viewerIsAdmin}
          onEdit={startCare}
        />
        <HubAdminsPanel
          tone={tone}
          admins={hub.admins}
          canManage={hub.viewerIsAdmin}
          viewerIsAffiliated={isAffiliated}
          titleRef={adminsFocus.targetRef}
          onAdd={dialogs.openAddAdmin}
          onEnd={dialogs.openEndAdmin}
        />
        <HubRosterPanel
          tone={tone}
          members={hub.members}
          groupName={hub.name}
          canManage={hub.viewerIsAdmin}
          viewerIsAffiliated={isAffiliated}
          newPersonId={celebration.newMemberId}
          fireKey={celebration.fireKey}
          titleRef={membersFocus.targetRef}
          onAdd={dialogs.openAddMember}
        />
        {termine}
        <HubRhythmPanel
          groupId={hub.groupId}
          groupName={hub.name}
          tone={tone}
          slots={hub.trainingSlots}
          canManage={hub.viewerIsAdmin}
        />
        {care}
        {history}
      </KkPanelStack>
      <HubPeekSheet
        tone={tone}
        members={hub.members}
        admins={hub.admins}
        canManage={hub.viewerIsAdmin}
        onEnd={endFromPeek}
      />
      {tools}
    </>
  );
};
