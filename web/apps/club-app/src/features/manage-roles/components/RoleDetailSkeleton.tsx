import { KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

const HEADER_LINES = 4;
const ROW_COUNT = 4;

const LOADING_LABEL = 'Die Rolle wird geladen';

export const RoleDetailSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <KkSkeletonBlock lines={HEADER_LINES} />
      <KkSkeletonRow count={ROW_COUNT} />
    </Stack>
  </AppSkeletonRegion>
);
