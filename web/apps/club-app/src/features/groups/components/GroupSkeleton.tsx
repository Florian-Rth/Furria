import { KkPanel, KkPanelSection, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const ABOUT_LINES = 3;
const MEMBER_ROWS = 8;
const ADMIN_ROWS = 2;
const RESERVED_LINES = 3;

const ABOUT_SIZE = { xs: 12, desktop: 7 };
const ADMINS_SIZE = { xs: 12, desktop: 5 };
const MEMBERS_SIZE = { xs: 12, desktop: 7 };
const RAIL_SIZE = { xs: 12, desktop: 5 };

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const GroupSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={ABOUT_SIZE} sx={{ minWidth: 0 }}>
        <KkPanelSection title={GROUP_SECTION_TITLES.about}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ABOUT_LINES} />
          </KkPanel>
        </KkPanelSection>
      </Grid>
      <Grid size={ADMINS_SIZE} sx={{ minWidth: 0 }}>
        <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
          <KkPanel variant="list">
            <KkSkeletonRow count={ADMIN_ROWS} />
          </KkPanel>
        </KkPanelSection>
      </Grid>
      <Grid size={MEMBERS_SIZE} sx={{ minWidth: 0 }}>
        <KkPanelSection title={GROUP_SECTION_TITLES.members}>
          <KkPanel variant="list">
            <KkSkeletonRow count={MEMBER_ROWS} />
          </KkPanel>
        </KkPanelSection>
      </Grid>
      <Grid size={RAIL_SIZE} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={GROUP_SECTION_TITLES.events}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={RESERVED_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={GROUP_SECTION_TITLES.photos}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={RESERVED_LINES} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
