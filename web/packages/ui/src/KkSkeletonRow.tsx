import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { personRowMetrics } from './internal/person-row-metrics';
import { rowDividerTop } from './internal/row-divider';
import { skeletonSurface } from './internal/skeleton-shimmer';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkSkeletonRowShape = 'person' | 'select';

const DEFAULT_COUNT = 6;
const BAR_RADIUS = `${kkTokens.radius.pill}px`;
const TITLE_BAR_WIDTH = '52%';
const META_BAR_WIDTH = '34%';

interface KkSkeletonRowProps {
  count?: number;
  shape?: KkSkeletonRowShape;
  sx?: KkSx;
}

export const KkSkeletonRow: FC<KkSkeletonRowProps> = ({
  count = DEFAULT_COUNT,
  shape = 'person',
  sx,
}) => {
  const rowKeys = Array.from({ length: count }, (_, index) => `kk-skeleton-row-${index}`);
  const showsAvatar = shape === 'person';
  const showsTrailing = shape === 'person';

  return (
    <Stack
      aria-hidden
      data-kk-skeleton-row
      sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {rowKeys.map((rowKey) => (
        <Stack
          key={rowKey}
          direction="row"
          sx={{
            alignItems: 'center',
            gap: personRowMetrics.gap,
            minWidth: 0,
            py: personRowMetrics.paddingY,
            ...rowDividerTop,
          }}
        >
          {showsAvatar ? (
            <Box
              sx={[
                skeletonSurface,
                {
                  width: personRowMetrics.avatarSize,
                  height: personRowMetrics.avatarSize,
                  borderRadius: '50%',
                  flexShrink: 0,
                },
              ]}
            />
          ) : null}
          <Stack sx={{ flexGrow: 1, minWidth: 0, gap: personRowMetrics.lineGap }}>
            <Box
              sx={[
                skeletonSurface,
                {
                  width: TITLE_BAR_WIDTH,
                  height: personRowMetrics.titleHeight,
                  borderRadius: BAR_RADIUS,
                },
              ]}
            />
            <Box
              sx={[
                skeletonSurface,
                {
                  width: META_BAR_WIDTH,
                  height: personRowMetrics.metaHeight,
                  borderRadius: BAR_RADIUS,
                },
              ]}
            />
          </Stack>
          {showsTrailing ? (
            <Box
              sx={[
                skeletonSurface,
                {
                  width: personRowMetrics.chipWidth,
                  height: personRowMetrics.chipHeight,
                  borderRadius: BAR_RADIUS,
                  flexShrink: 0,
                },
              ]}
            />
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
};
