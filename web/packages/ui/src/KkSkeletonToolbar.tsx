import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from './internal/skeleton-shimmer';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const DEFAULT_CHIPS = 4;
const CHIP_HEIGHT = 30;
const CHIP_WIDTHS = [64, 86, 78, 96, 82];
const CHIP_RADIUS = `${kkTokens.radius.pill}px`;

interface KkSkeletonToolbarProps {
  chips?: number;
  sx?: KkSx;
}

export const KkSkeletonToolbar: FC<KkSkeletonToolbarProps> = ({ chips = DEFAULT_CHIPS, sx }) => {
  const chipBars = Array.from({ length: chips }, (_, index) => ({
    key: `kk-skeleton-toolbar-chip-${index}`,
    width: CHIP_WIDTHS[index % CHIP_WIDTHS.length],
  }));

  return (
    <Stack
      direction="row"
      aria-hidden
      data-kk-skeleton-toolbar
      sx={[{ minWidth: 0, gap: 1, alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {chipBars.map((bar) => (
        <Box
          key={bar.key}
          sx={[
            skeletonSurface,
            { width: bar.width, height: CHIP_HEIGHT, borderRadius: CHIP_RADIUS, flexShrink: 0 },
          ]}
        />
      ))}
    </Stack>
  );
};
