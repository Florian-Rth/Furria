import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MemberDetails } from '../schemas';
import { MemberClubPanel } from './MemberClubPanel';
import { MemberContactPanel } from './MemberContactPanel';
import { MemberGroupsPanel } from './MemberGroupsPanel';
import { MemberRolesPanel } from './MemberRolesPanel';

interface MemberViewProps {
  member: MemberDetails;
}

export const MemberView: FC<MemberViewProps> = ({ member }) => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <MemberGroupsPanel groups={member.groups} firstName={member.firstName} />
        <MemberRolesPanel roles={member.roles} firstName={member.firstName} />
      </Stack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <MemberContactPanel contact={member.contact} firstName={member.firstName} />
        <MemberClubPanel member={member} />
      </Stack>
    </Grid>
  </Grid>
);
