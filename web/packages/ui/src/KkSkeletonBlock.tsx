import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from './internal/skeleton-shimmer';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const DEFAULT_LINES = 4;
const TITLE_BAR_WIDTH = '55%';
const TITLE_BAR_HEIGHT = 22;
const TEXT_BAR_HEIGHT = 13;
const TEXT_BAR_WIDE = '100%';
const TEXT_BAR_NARROW = '76%';
const PILL_BAR_WIDTH = 110;
const PILL_BAR_HEIGHT = 26;
const BAR_RADIUS = `${kkTokens.radius.pill}px`;

interface KkSkeletonBar {
  key: string;
  width: string | number;
  height: number;
}

interface KkSkeletonBlockProps {
  lines?: number;
  sx?: KkSx;
}

export const KkSkeletonBlock: FC<KkSkeletonBlockProps> = ({ lines = DEFAULT_LINES, sx }) => {
  const bars = Array.from({ length: lines }, (_, index): KkSkeletonBar => {
    const key = `kk-skeleton-block-bar-${index}`;

    if (index === 0) {
      return { key, width: TITLE_BAR_WIDTH, height: TITLE_BAR_HEIGHT };
    }

    if (index === lines - 1) {
      return { key, width: PILL_BAR_WIDTH, height: PILL_BAR_HEIGHT };
    }

    return {
      key,
      width: index % 2 === 1 ? TEXT_BAR_WIDE : TEXT_BAR_NARROW,
      height: TEXT_BAR_HEIGHT,
    };
  });

  return (
    <Stack
      aria-hidden
      data-kk-skeleton-block
      sx={[{ minWidth: 0, gap: 1.25 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {bars.map((bar) => (
        <Box
          key={bar.key}
          sx={[skeletonSurface, { width: bar.width, height: bar.height, borderRadius: BAR_RADIUS }]}
        />
      ))}
    </Stack>
  );
};
