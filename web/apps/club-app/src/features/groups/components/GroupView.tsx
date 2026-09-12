import { KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupDetails } from '../schemas';
import { GroupAdminsPanel } from './GroupAdminsPanel';
import { GroupDescription } from './GroupDescription';
import { GroupEventsSlot } from './GroupEventsSlot';
import { GroupMembersPanel } from './GroupMembersPanel';
import { GroupPhotosSlot } from './GroupPhotosSlot';

interface GroupViewProps {
  group: GroupDetails;
}

export const GroupView: FC<GroupViewProps> = ({ group }) => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <GroupMembersPanel members={group.members} groupName={group.name} />
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <KkStickyRail>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <GroupDescription groupName={group.name} description={group.description} />
          <GroupAdminsPanel admins={group.admins} isRecruiting={group.isRecruiting} />
          <GroupEventsSlot />
          <GroupPhotosSlot />
        </Stack>
      </KkStickyRail>
    </Grid>
  </Grid>
);
