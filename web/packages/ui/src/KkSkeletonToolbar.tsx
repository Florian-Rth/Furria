import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from './internal/skeleton-shimmer';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const DEFAULT_CHIPS = 4;
const FIELD_HEIGHT = 56;
const CHIP_HEIGHT = 30;
const CHIP_WIDTHS = [64, 86, 78, 96, 82];
const CHIP_RADIUS = `${kkTokens.radius.pill}px`;
const FIELD_RADIUS = `${kkTokens.radius.base}px`;

interface KkSkeletonToolbarProps {
  chips?: number;
  sx?: KkSx;
}

export const KkSkeletonToolbar: FC<KkSkeletonToolbarProps> = ({ chips = DEFAULT_CHIPS, sx }) => {
  const chipBars = Array.from({ length: chips }, (_, index) => ({
    key: `kk-skeleton-toolbar-chip-${index}`,
    width: CHIP_WIDTHS[index % CHIP_WIDTHS.length],
  }));

  const chipRow =
    chipBars.length === 0 ? null : (
      <Stack direction="row" sx={{ gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
        {chipBars.map((bar) => (
          <Box
            key={bar.key}
            sx={[
              skeletonSurface,
              {
                width: bar.width,
                height: CHIP_HEIGHT,
                borderRadius: CHIP_RADIUS,
                flexShrink: 0,
              },
            ]}
          />
        ))}
      </Stack>
    );

  return (
    <Stack
      aria-hidden
      data-kk-skeleton-toolbar
      sx={[{ minWidth: 0, gap: 1.75 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        sx={[skeletonSurface, { width: '100%', height: FIELD_HEIGHT, borderRadius: FIELD_RADIUS }]}
      />
      {chipRow}
    </Stack>
  );
};
