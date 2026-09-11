import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useHubCelebration } from '../hooks/use-hub-celebration';
import { useHubDialogs } from '../hooks/use-hub-dialogs';
import type { HubDetails } from '../schemas';
import { AddMemberDialog } from './AddMemberDialog';
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
  const dialogs = useHubDialogs(hub.members);
  const celebration = useHubCelebration();

  const onAdded = (): void => {
    dialogs.close();
    celebration.celebrate();
  };

  const history = hub.viewerIsAdmin ? (
    <HubHistoryPanel pastMembers={hub.pastMembers} pastAdmins={hub.pastAdmins} />
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
    </>
  ) : null;

  return (
    <>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <HubGroupSection
              groupId={hub.groupId}
              name={hub.name}
              description={hub.description}
              isRecruiting={hub.isRecruiting}
              canManage={hub.viewerIsAdmin}
            />
            <HubCelebration fireKey={celebration.fireKey}>
              <HubMembersPanel
                members={hub.members}
                groupName={hub.name}
                canManage={hub.viewerIsAdmin}
                onAdd={dialogs.openAddMember}
                onEnd={dialogs.openEndMembership}
              />
            </HubCelebration>
            {history}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <HubAdminsPanel admins={hub.admins} />
            <HubEventsSlot />
            <HubPhotosSlot />
          </Stack>
        </Grid>
      </Grid>
      {tools}
    </>
  );
};
