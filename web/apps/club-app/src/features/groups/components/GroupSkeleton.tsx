import { KkPanel, KkPanelSection, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUP_SECTION_TITLES } from '../groups-labels';

const ABOUT_LINES = 2;
const MEMBER_LINES = 6;
const ADMIN_LINES = 2;
const PHOTO_LINES = 3;

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const GroupSkeleton: FC = () => (
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
            <KkPanel variant="block">
              <KkSkeletonBlock lines={MEMBER_LINES} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={ADMIN_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={GROUP_SECTION_TITLES.photos}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={PHOTO_LINES} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
