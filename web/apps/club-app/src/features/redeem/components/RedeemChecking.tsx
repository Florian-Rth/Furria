import { KkSkeletonText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

export const RedeemChecking: FC = () => (
  <Stack aria-busy sx={{ gap: 1.5, minWidth: 0 }}>
    <KkSkeletonText width="60%" />
    <KkSkeletonText />
    <KkSkeletonText width="80%" />
  </Stack>
);
