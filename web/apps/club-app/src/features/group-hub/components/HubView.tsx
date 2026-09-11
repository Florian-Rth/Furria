import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { HubDetails } from '../schemas';
import { HubAdminsPanel } from './HubAdminsPanel';
import { HubEventsSlot } from './HubEventsSlot';
import { HubHistoryPanel } from './HubHistoryPanel';
import { HubInfoPanel } from './HubInfoPanel';
import { HubMembersPanel } from './HubMembersPanel';
import { HubPhotosSlot } from './HubPhotosSlot';

interface HubViewProps {
  hub: HubDetails;
}

export const HubView: FC<HubViewProps> = ({ hub }) => {
  const history = hub.viewerIsAdmin ? (
    <HubHistoryPanel pastMembers={hub.pastMembers} pastAdmins={hub.pastAdmins} />
  ) : null;

  return (
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <HubInfoPanel
            groupName={hub.name}
            description={hub.description}
            isRecruiting={hub.isRecruiting}
          />
          <HubMembersPanel members={hub.members} groupName={hub.name} />
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
  );
};
