import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { useHubCelebration } from '../hooks/use-hub-celebration';
import { useHubDialogs } from '../hooks/use-hub-dialogs';
import type { HubDetails } from '../schemas';
import { AddAdminDialog } from './AddAdminDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { EndAdminDialog } from './EndAdminDialog';
import { EndMembershipDialog } from './EndMembershipDialog';
import { HubAdminsPanel } from './HubAdminsPanel';
import { HubCelebration } from './HubCelebration';
import { HubEventsSlot } from './HubEventsSlot';
import { HubGroupSection } from './HubGroupSection';
import { HubHistoryPanel } from './HubHistoryPanel';
import { HubMembersPanel } from './HubMembersPanel';
import { HubPhotosSlot } from './HubPhotosSlot';

interface HubViewProps {
  hub: HubDetails;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const dialogs = useHubDialogs(hub.members, hub.admins);
  const celebration = useHubCelebration();
  const { isAffiliated } = usePermissions();

  const onAdded = (): void => {
    dialogs.close();
    celebration.celebrate();
  };

  const groupSection = (
    <HubGroupSection
      groupId={hub.groupId}
      name={hub.name}
      description={hub.description}
      isRecruiting={hub.isRecruiting}
      canManage={hub.viewerIsAdmin}
    />
  );

  const membersSection = (
    <HubCelebration fireKey={celebration.fireKey}>
      <HubMembersPanel
        members={hub.members}
        groupName={hub.name}
        canManage={hub.viewerIsAdmin}
        canOpenPerson={isAffiliated}
        onAdd={dialogs.openAddMember}
        onEnd={dialogs.openEndMembership}
      />
    </HubCelebration>
  );

  const readingColumn = hub.viewerIsAdmin ? (
    <>
      {membersSection}
      {groupSection}
    </>
  ) : (
    <>
      {groupSection}
      {membersSection}
    </>
  );

  const history = hub.viewerIsAdmin ? (
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <HubHistoryPanel pastMembers={hub.pastMembers} pastAdmins={hub.pastAdmins} />
    </Grid>
  ) : null;

  const tools = hub.viewerIsAdmin ? (
    <>
      <AddMemberDialog
        groupId={hub.groupId}
        groupName={hub.name}
        open={dialogs.isAddMemberOpen}
        onClose={dialogs.close}
        onAdded={onAdded}
      />
      <EndMembershipDialog
        groupId={hub.groupId}
        groupName={hub.name}
        member={dialogs.endMember}
        onClose={dialogs.close}
      />
      <AddAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        open={dialogs.isAddAdminOpen}
        onClose={dialogs.close}
        onAppointed={dialogs.close}
      />
      <EndAdminDialog
        groupId={hub.groupId}
        groupName={hub.name}
        admin={dialogs.endAdmin}
        runningAdmins={hub.admins.length}
        onClose={dialogs.close}
      />
    </>
  ) : null;

  return (
    <>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>{readingColumn}</Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <HubAdminsPanel
              admins={hub.admins}
              canManage={hub.viewerIsAdmin}
              canOpenPerson={isAffiliated}
              onAdd={dialogs.openAddAdmin}
              onEnd={dialogs.openEndAdmin}
            />
            <HubEventsSlot />
            <HubPhotosSlot />
          </Stack>
        </Grid>
        {history}
      </Grid>
      {tools}
    </>
  );
};
