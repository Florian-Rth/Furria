import { KkPanel, KkPanelHeader, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';

const LIST_ROWS = 6;
const DETAIL_LINES = 4;

const LOADING_LABEL = 'Die Gruppenverwaltung wird geladen';

export const ManagedGroupsSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <KkPanelHeader title={MANAGE_GROUPS_SECTION_TITLES.list} />
          <KkPanel variant="list">
            <KkSkeletonRow count={LIST_ROWS} />
          </KkPanel>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <KkPanelHeader title={MANAGE_GROUPS_SECTION_TITLES.group} />
          <KkPanel variant="block">
            <KkSkeletonBlock lines={DETAIL_LINES} />
          </KkPanel>
        </Stack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
