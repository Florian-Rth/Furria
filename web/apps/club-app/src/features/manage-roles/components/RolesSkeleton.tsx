import { KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';

const MASTER_ROWS = 6;
const DETAIL_LINES = 4;
const DETAIL_ROWS = 4;

export const RolesSkeleton: FC = () => (
  <Grid container spacing={{ xs: 3, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 4 }} sx={{ minWidth: 0 }}>
      <KkSkeletonRow count={MASTER_ROWS} />
    </Grid>
    <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
      <KkSkeletonBlock lines={DETAIL_LINES} />
      <KkSkeletonRow count={DETAIL_ROWS} sx={{ mt: 3 }} />
    </Grid>
  </Grid>
);
