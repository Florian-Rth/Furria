import Box from '@mui/material/Box';
import type { FC } from 'react';
import { skeletonSurface } from './internal/skeleton-shimmer';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const DEFAULT_WIDTH = '64%';
const BAR_HEIGHT = '0.8em';
const BAR_RADIUS = `${kkTokens.radius.pill}px`;

interface KkSkeletonTextProps {
  width?: string;
  sx?: KkSx;
}

export const KkSkeletonText: FC<KkSkeletonTextProps> = ({ width = DEFAULT_WIDTH, sx }) => (
  <Box
    component="span"
    aria-hidden
    data-kk-skeleton-text
    sx={[
      skeletonSurface,
      {
        display: 'inline-block',
        width,
        maxWidth: '100%',
        height: BAR_HEIGHT,
        verticalAlign: 'middle',
        borderRadius: BAR_RADIUS,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
