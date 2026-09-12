import {
  KkPanel,
  KkPanelHeader,
  KkSkeletonBlock,
  KkSkeletonRow,
  KkSkeletonToolbar,
  KkStickyBar,
  KkStickyRail,
} from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MEMBERS_SECTION_TITLE } from '../members-labels';

const SKELETON_ROWS = 8;
const INTRO_LINES = 2;
const INDEX_LINES = 3;
const STATS_LINES = 4;
const TOOLBAR_CHIPS = 5;
const LOADING_LABEL = 'Mitgliederliste wird geladen';

export const MembersSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkSkeletonBlock lines={INTRO_LINES} />
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <KkPanelHeader title={MEMBERS_SECTION_TITLE} />
          <KkStickyBar>
            <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
          </KkStickyBar>
          <KkSkeletonRow count={SKELETON_ROWS} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 4 }} sx={{ display: { xs: 'none', desktop: 'block' } }}>
        <KkStickyRail>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={INDEX_LINES} />
            </KkPanel>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={STATS_LINES} />
            </KkPanel>
          </Stack>
        </KkStickyRail>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
