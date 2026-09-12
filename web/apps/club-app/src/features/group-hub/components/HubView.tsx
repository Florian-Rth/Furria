import type { FC } from 'react';
import {
  GroupDetailLayout,
  GroupEventsSlot,
  GroupHistoryPanel,
  GroupPhotosSlot,
} from '@/features/group-detail';
import { usePermissions, useReturnFocus } from '@/features/session';
import { useHubCelebration } from '../hooks/use-hub-celebration';
import { useHubDialogs } from '../hooks/use-hub-dialogs';
import type { HubDetails } from '../schemas';
import { AddAdminDialog } from './AddAdminDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { EndAdminDialog } from './EndAdminDialog';
import { EndMembershipDialog } from './EndMembershipDialog';
import { HubAdminsPanel } from './HubAdminsPanel';
import { HubGroupSection } from './HubGroupSection';
import { HubMembersPanel } from './HubMembersPanel';

const HISTORY_META = 'nur für Gruppen-Admins';

interface HubViewProps {
  hub: HubDetails;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const dialogs = useHubDialogs(hub.members, hub.admins);
  const celebration = useHubCelebration();
  const { isAffiliated } = usePermissions();
  const membersFocus = useReturnFocus();
  const adminsFocus = useReturnFocus();

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

  const onAdminAppointed = (personId: number): void => {
    dialogs.close();
    celebration.markAdmin(personId);
  };

  const history = hub.viewerIsAdmin ? (
    <GroupHistoryPanel
      pastMembers={hub.pastMembers}
      pastAdmins={hub.pastAdmins}
      meta={HISTORY_META}
    />
  ) : undefined;

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

  const about = (
    <HubGroupSection
      groupId={hub.groupId}
      name={hub.name}
      description={hub.description}
      isRecruiting={hub.isRecruiting}
      canManage={hub.viewerIsAdmin}
    />
  );

  const admins = (
    <HubAdminsPanel
      admins={hub.admins}
      canManage={hub.viewerIsAdmin}
      viewerIsAffiliated={isAffiliated}
      newPersonId={celebration.newAdminId}
      titleRef={adminsFocus.targetRef}
      onAdd={dialogs.openAddAdmin}
      onEnd={dialogs.openEndAdmin}
    />
  );

  const members = (
    <HubMembersPanel
      members={hub.members}
      groupName={hub.name}
      canManage={hub.viewerIsAdmin}
      viewerIsAffiliated={isAffiliated}
      newPersonId={celebration.newMemberId}
      fireKey={celebration.fireKey}
      titleRef={membersFocus.targetRef}
      onAdd={dialogs.openAddMember}
      onEnd={dialogs.openEndMembership}
    />
  );

  return (
    <>
      <GroupDetailLayout
        about={about}
        admins={admins}
        members={members}
        history={history}
        events={<GroupEventsSlot />}
        photos={<GroupPhotosSlot />}
      />
      {tools}
    </>
  );
};
