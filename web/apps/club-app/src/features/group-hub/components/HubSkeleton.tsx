import { KkPanel, KkPanelSection, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { HubEventsSlot } from './HubEventsSlot';
import { HubPhotosSlot } from './HubPhotosSlot';

const ABOUT_LINES = 3;
const MEMBER_ROWS = 5;
const ADMIN_ROWS = 2;

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const HubSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={GROUP_SECTION_TITLES.about}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={ABOUT_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={GROUP_SECTION_TITLES.members}>
            <KkPanel variant="list">
              <KkSkeletonRow count={MEMBER_ROWS} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
            <KkPanel variant="list">
              <KkSkeletonRow count={ADMIN_ROWS} />
            </KkPanel>
          </KkPanelSection>
          <HubEventsSlot />
          <HubPhotosSlot />
        </Stack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
