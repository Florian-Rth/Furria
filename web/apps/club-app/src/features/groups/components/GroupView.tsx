import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GroupEventsSlot, GroupPhotosSlot } from '@/features/group-detail';
import type { GroupDetails } from '../schemas';
import { GroupAdminsPanel } from './GroupAdminsPanel';
import { GroupDescription } from './GroupDescription';
import { GroupMembersPanel } from './GroupMembersPanel';

const ABOUT_SIZE = { xs: 12, desktop: 7 };
const ABOUT_ORDER = { xs: 1, desktop: 1 };
const MEMBERS_SIZE = { xs: 12, desktop: 7 };
const MEMBERS_ORDER = { xs: 2, desktop: 3 };
const ADMINS_SIZE = { xs: 12, desktop: 5 };
const ADMINS_ORDER = { xs: 3, desktop: 2 };
const RESERVED_SIZE = { xs: 12, desktop: 5 };
const RESERVED_ORDER = { xs: 4, desktop: 4 };

interface GroupViewProps {
  group: GroupDetails;
}

export const GroupView: FC<GroupViewProps> = ({ group }) => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={ABOUT_SIZE} sx={{ minWidth: 0, order: ABOUT_ORDER }}>
      <GroupDescription groupName={group.name} description={group.description} />
    </Grid>
    <Grid size={ADMINS_SIZE} sx={{ minWidth: 0, order: ADMINS_ORDER }}>
      <GroupAdminsPanel admins={group.admins} isRecruiting={group.isRecruiting} />
    </Grid>
    <Grid size={MEMBERS_SIZE} sx={{ minWidth: 0, order: MEMBERS_ORDER }}>
      <GroupMembersPanel members={group.members} groupName={group.name} />
    </Grid>
    <Grid size={RESERVED_SIZE} sx={{ minWidth: 0, order: RESERVED_ORDER }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <GroupEventsSlot />
        <GroupPhotosSlot />
      </Stack>
    </Grid>
  </Grid>
);
