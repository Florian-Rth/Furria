import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from './internal/skeleton-shimmer';
import { kkTokens } from './tokens';

const DEFAULT_COUNT = 6;
const AVATAR_SIZE = 38;
const TITLE_BAR_HEIGHT = 13;
const META_BAR_HEIGHT = 10;
const CHIP_BAR_WIDTH = 54;
const CHIP_BAR_HEIGHT = 20;
const BAR_RADIUS = `${kkTokens.radius.pill}px`;

interface KkSkeletonRowProps {
  count?: number;
}

export const KkSkeletonRow: FC<KkSkeletonRowProps> = ({ count = DEFAULT_COUNT }) => {
  const rowKeys = Array.from({ length: count }, (_, index) => `kk-skeleton-row-${index}`);

  return (
    <Stack aria-hidden data-kk-skeleton-row sx={{ minWidth: 0 }}>
      {rowKeys.map((rowKey) => (
        <Stack
          key={rowKey}
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1.5,
            minWidth: 0,
            py: 1.625,
            borderTop: kkTokens.line.hair,
            borderColor: 'divider',
            '&:first-of-type': { borderTop: 'none' },
          }}
        >
          <Box
            sx={[
              skeletonSurface,
              { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: '50%', flexShrink: 0 },
            ]}
          />
          <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 1 }}>
            <Box
              sx={[
                skeletonSurface,
                { width: '52%', height: TITLE_BAR_HEIGHT, borderRadius: BAR_RADIUS },
              ]}
            />
            <Box
              sx={[
                skeletonSurface,
                { width: '34%', height: META_BAR_HEIGHT, borderRadius: BAR_RADIUS },
              ]}
            />
          </Stack>
          <Box
            sx={[
              skeletonSurface,
              {
                width: CHIP_BAR_WIDTH,
                height: CHIP_BAR_HEIGHT,
                borderRadius: BAR_RADIUS,
                flexShrink: 0,
              },
            ]}
          />
        </Stack>
      ))}
    </Stack>
  );
};
