import type { FC } from 'react';
import { GroupDetailLayout, GroupHistoryPanel } from '@/features/group-detail';
import {
  AddAdminDialog,
  AddMemberDialog,
  EndAdminDialog,
  EndMembershipDialog,
} from '@/features/group-hub';
import { usePermissions } from '@/features/session';
import { useOverrideDialogs } from '../hooks/use-override-dialogs';
import { useOverrideRefresh } from '../hooks/use-override-refresh';
import type { ManagedGroupDetails } from '../schemas';
import { OverrideAdminsPanel } from './OverrideAdminsPanel';
import { OverrideMembersPanel } from './OverrideMembersPanel';

interface GroupOverrideDetailsProps {
  group: ManagedGroupDetails;
}

export const GroupOverrideDetails: FC<GroupOverrideDetailsProps> = ({ group }) => {
  const dialogs = useOverrideDialogs(group.members, group.admins);
  const refresh = useOverrideRefresh(group.groupId);
  const { isAffiliated } = usePermissions();
  const canManage = group.archivedOn === null;

  const settle = (): void => {
    dialogs.close();
    refresh();
  };

  const tools = canManage ? (
    <>
      <AddMemberDialog
        groupId={group.groupId}
        groupName={group.name}
        open={dialogs.isAddMemberOpen}
        onClose={dialogs.close}
        onAdded={settle}
      />
      <EndMembershipDialog
        groupId={group.groupId}
        groupName={group.name}
        member={dialogs.endMember}
        onClose={settle}
      />
      <AddAdminDialog
        groupId={group.groupId}
        groupName={group.name}
        open={dialogs.isAddAdminOpen}
        onClose={dialogs.close}
        onAppointed={settle}
      />
      <EndAdminDialog
        groupId={group.groupId}
        groupName={group.name}
        admin={dialogs.endAdmin}
        runningAdmins={group.admins.length}
        onClose={settle}
      />
    </>
  ) : null;

  const members = (
    <OverrideMembersPanel
      members={group.members}
      groupName={group.name}
      canManage={canManage}
      canOpenPerson={isAffiliated}
      onAdd={dialogs.openAddMember}
      onEnd={dialogs.openEndMembership}
    />
  );

  const admins = (
    <OverrideAdminsPanel
      admins={group.admins}
      canManage={canManage}
      canOpenPerson={isAffiliated}
      onAdd={dialogs.openAddAdmin}
      onEnd={dialogs.openEndAdmin}
    />
  );

  const history = (
    <GroupHistoryPanel pastMembers={group.pastMembers} pastAdmins={group.pastAdmins} />
  );

  return (
    <>
      <GroupDetailLayout stacked admins={admins} members={members} history={history} />
      {tools}
    </>
  );
};
