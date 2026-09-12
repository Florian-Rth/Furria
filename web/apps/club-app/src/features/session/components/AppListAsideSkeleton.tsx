import { KkPanel, KkSkeletonBlock } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const INDEX_LINES = 3;
const STATS_LINES = 4;

export const AppListAsideSkeleton: FC = () => (
  <Stack sx={{ gap: 3.5, minWidth: 0 }}>
    <KkPanel variant="block">
      <KkSkeletonBlock lines={INDEX_LINES} />
    </KkPanel>
    <KkPanel variant="block">
      <KkSkeletonBlock lines={STATS_LINES} />
    </KkPanel>
  </Stack>
);
