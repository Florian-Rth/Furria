import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import { KkCard } from '../KkCard/KkCard';
import { KkSkeletonBlock } from '../KkSkeletonBlock';
import type { KkSx } from '../kk-sx';

const STRIP_WIDTH = { xs: 13, desktop: 16 };
const BODY_LINES = 4;
const BODY_INSET = { xs: 1.5, desktop: 2 };

interface KkGroupCardSkeletonProps {
  sx?: KkSx;
}

export const KkGroupCardSkeleton: FC<KkGroupCardSkeletonProps> = ({ sx }) => (
  <KkCard sx={sx}>
    <Stack direction="row" sx={(theme) => ({ minHeight: theme.spacing(15), flexGrow: 1 })}>
      <Box
        aria-hidden
        sx={(theme) => ({
          flexShrink: 0,
          width: { xs: theme.spacing(STRIP_WIDTH.xs), desktop: theme.spacing(STRIP_WIDTH.desktop) },
          ...skeletonSurface(theme),
        })}
      />
      <KkSkeletonBlock lines={BODY_LINES} sx={{ flexGrow: 1, minWidth: 0, p: BODY_INSET }} />
    </Stack>
  </KkCard>
);
