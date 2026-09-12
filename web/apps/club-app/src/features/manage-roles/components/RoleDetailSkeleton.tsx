import { KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const HEADER_LINES = 4;
const ROW_COUNT = 4;

export const RoleDetailSkeleton: FC = () => (
  <Stack sx={{ gap: 3, minWidth: 0 }}>
    <KkSkeletonBlock lines={HEADER_LINES} />
    <KkSkeletonRow count={ROW_COUNT} />
  </Stack>
);
