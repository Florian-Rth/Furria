import { KkPanel, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const CARD_KEYS = ['first', 'second', 'third'] as const;
const CARD_LINES = 4;
const INTRO_LINES = 1;

export const GroupsSkeleton: FC = () => (
  <Stack sx={{ gap: 3, minWidth: 0 }}>
    <KkSkeletonBlock lines={INTRO_LINES} />
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {CARD_KEYS.map((key) => (
        <Grid key={key} size={{ xs: 12, sm: 6, desktop: 4 }} sx={{ minWidth: 0 }}>
          <KkPanel variant="block" sx={{ height: '100%' }}>
            <KkSkeletonBlock lines={CARD_LINES} />
          </KkPanel>
        </Grid>
      ))}
    </Grid>
  </Stack>
);
