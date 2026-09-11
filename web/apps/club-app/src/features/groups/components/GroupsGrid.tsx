import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { GroupSummary } from '../schemas';
import { GroupCard } from './GroupCard';

const FULL_HEIGHT = { height: '100%' } as const;

interface GroupsGridProps {
  groups: readonly GroupSummary[];
}

export const GroupsGrid: FC<GroupsGridProps> = ({ groups }) => (
  <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
    {groups.map((group) => (
      <Grid key={group.groupId} size={{ xs: 12, sm: 6, desktop: 4 }} sx={{ minWidth: 0 }}>
        <GroupCard group={group} sx={FULL_HEIGHT} />
      </Grid>
    ))}
  </Grid>
);
