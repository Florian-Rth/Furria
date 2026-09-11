import { KkPanel, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HUB_SECTION_TITLES } from '../group-hub-labels';
import { HubEventsSlot } from './HubEventsSlot';
import { HubPhotosSlot } from './HubPhotosSlot';
import { HubSection } from './HubSection';

const ABOUT_LINES = 3;
const MEMBER_ROWS = 5;
const ADMIN_ROWS = 2;

export const HubSkeleton: FC = () => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <HubSection title={HUB_SECTION_TITLES.about}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ABOUT_LINES} />
          </KkPanel>
        </HubSection>
        <HubSection title={HUB_SECTION_TITLES.members}>
          <KkPanel variant="list">
            <KkSkeletonRow count={MEMBER_ROWS} />
          </KkPanel>
        </HubSection>
      </Stack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <HubSection title={HUB_SECTION_TITLES.admins}>
          <KkPanel variant="list">
            <KkSkeletonRow count={ADMIN_ROWS} />
          </KkPanel>
        </HubSection>
        <HubEventsSlot />
        <HubPhotosSlot />
      </Stack>
    </Grid>
  </Grid>
);
