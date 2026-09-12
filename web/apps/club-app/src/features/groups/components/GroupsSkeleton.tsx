import { KkPanel, KkPanelHeader, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUPS_SECTION_TITLE } from '../groups-labels';

const CARD_KEYS = ['first', 'second', 'third'] as const;
const CARD_LINES = 4;
const INTRO_LINES = 1;
const LOADING_LABEL = 'Gruppen werden geladen';

export const GroupsSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkSkeletonBlock lines={INTRO_LINES} />
    <KkPanelHeader title={GROUPS_SECTION_TITLE} />
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {CARD_KEYS.map((key) => (
        <Grid key={key} size={{ xs: 12, sm: 6, desktop: 4 }} sx={{ minWidth: 0 }}>
          <KkPanel variant="block" sx={{ height: '100%' }}>
            <KkSkeletonBlock lines={CARD_LINES} />
          </KkPanel>
        </Grid>
      ))}
    </Grid>
  </AppSkeletonRegion>
);
