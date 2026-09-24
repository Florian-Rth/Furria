import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GroupCardSkeleton } from './GroupCardSkeleton';

const LOADING_LABEL = 'Gruppen werden geladen';
const CARD_KEYS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const;
const CARD_SIZE = { xs: 6, sm: 4, desktop: 3 };
const GRID_SPACING = { xs: 1.5, desktop: 2.5 };

export const GroupsSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
      {CARD_KEYS.map((key) => (
        <Grid key={key} size={CARD_SIZE} sx={{ minWidth: 0 }}>
          <GroupCardSkeleton />
        </Grid>
      ))}
    </Grid>
  </AppSkeletonRegion>
);
