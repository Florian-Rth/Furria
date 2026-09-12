import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GroupEventsSlot, GroupHistoryPanel, GroupPhotosSlot } from '@/features/group-detail';
import { usePermissions } from '@/features/session';
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

const ABOUT_SIZE = { xs: 12, desktop: 7 };
const ABOUT_ORDER = { xs: 1, desktop: 1 };
const MEMBERS_SIZE = { xs: 12, desktop: 7 };
const MEMBERS_ORDER = { xs: 2, desktop: 3 };
const ADMINS_SIZE = { xs: 12, desktop: 5 };
const ADMINS_ORDER = { xs: 3, desktop: 2 };
const HISTORY_SIZE = { xs: 12, desktop: 12 };
const HISTORY_ORDER = { xs: 4, desktop: 5 };
const RESERVED_SIZE = { xs: 12, desktop: 5 };
const RESERVED_ORDER = { xs: 5, desktop: 4 };

const HISTORY_META = 'nur für Gruppen-Admins';

interface HubViewProps {
  hub: HubDetails;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const dialogs = useHubDialogs(hub.members, hub.admins);
  const celebration = useHubCelebration();
  const { isAffiliated } = usePermissions();

  const onMemberAdded = (personId: number): void => {
    dialogs.close();
    celebration.celebrateMember(personId);
  };

  const onAdminAppointed = (personId: number): void => {
    dialogs.close();
    celebration.markAdmin(personId);
  };

  const history = hub.viewerIsAdmin ? (
    <Grid size={HISTORY_SIZE} sx={{ minWidth: 0, order: HISTORY_ORDER }}>
      <GroupHistoryPanel
        pastMembers={hub.pastMembers}
        pastAdmins={hub.pastAdmins}
        meta={HISTORY_META}
      />
    </Grid>
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
      />
    </>
  ) : null;

  return (
    <>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={ABOUT_SIZE} sx={{ minWidth: 0, order: ABOUT_ORDER }}>
          <HubGroupSection
            groupId={hub.groupId}
            name={hub.name}
            description={hub.description}
            isRecruiting={hub.isRecruiting}
            canManage={hub.viewerIsAdmin}
          />
        </Grid>
        <Grid size={ADMINS_SIZE} sx={{ minWidth: 0, order: ADMINS_ORDER }}>
          <HubAdminsPanel
            admins={hub.admins}
            canManage={hub.viewerIsAdmin}
            canOpenPerson={isAffiliated}
            newPersonId={celebration.newAdminId}
            onAdd={dialogs.openAddAdmin}
            onEnd={dialogs.openEndAdmin}
          />
        </Grid>
        <Grid size={MEMBERS_SIZE} sx={{ minWidth: 0, order: MEMBERS_ORDER }}>
          <HubMembersPanel
            members={hub.members}
            groupName={hub.name}
            canManage={hub.viewerIsAdmin}
            canOpenPerson={isAffiliated}
            newPersonId={celebration.newMemberId}
            fireKey={celebration.fireKey}
            onAdd={dialogs.openAddMember}
            onEnd={dialogs.openEndMembership}
          />
        </Grid>
        {history}
        <Grid size={RESERVED_SIZE} sx={{ minWidth: 0, order: RESERVED_ORDER }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <GroupEventsSlot />
            <GroupPhotosSlot />
          </Stack>
        </Grid>
      </Grid>
      {tools}
    </>
  );
};
