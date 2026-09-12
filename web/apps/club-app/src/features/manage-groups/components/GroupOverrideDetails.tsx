import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  AddAdminDialog,
  AddMemberDialog,
  EndAdminDialog,
  EndMembershipDialog,
} from '@/features/group-hub';
import { useOverrideDialogs } from '../hooks/use-override-dialogs';
import { useOverrideRefresh } from '../hooks/use-override-refresh';
import type { ManagedGroupDetails } from '../schemas';
import { OverrideAdminsPanel } from './OverrideAdminsPanel';
import { OverrideHistoryPanel } from './OverrideHistoryPanel';
import { OverrideMembersPanel } from './OverrideMembersPanel';

interface GroupOverrideDetailsProps {
  group: ManagedGroupDetails;
}

export const GroupOverrideDetails: FC<GroupOverrideDetailsProps> = ({ group }) => {
  const dialogs = useOverrideDialogs(group.members, group.admins);
  const refresh = useOverrideRefresh(group.groupId);
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

  return (
    <>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <OverrideMembersPanel
          members={group.members}
          canManage={canManage}
          onAdd={dialogs.openAddMember}
          onEnd={dialogs.openEndMembership}
        />
        <OverrideAdminsPanel
          admins={group.admins}
          canManage={canManage}
          onAdd={dialogs.openAddAdmin}
          onEnd={dialogs.openEndAdmin}
        />
        <OverrideHistoryPanel pastMembers={group.pastMembers} pastAdmins={group.pastAdmins} />
      </Stack>
      {tools}
    </>
  );
};
