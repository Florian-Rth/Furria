import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import {
  MOTTO_STAGE_CONTENT_GAP,
  MOTTO_STAGE_HEADLINE_GAP,
  MOTTO_STAGE_TEXT_WIDTH,
  mottoStageChrome,
} from './internal/motto-stage-chrome';

const BAR_RADIUS = `${kkTokens.radius.pill}px`;
const META_BAR = { width: '38%', height: 12 };
const MOTTO_BARS = [
  { key: 'motto-first-line', width: '100%', height: 28 },
  { key: 'motto-second-line', width: '64%', height: 28 },
];
const COUNTDOWN_BAR = { width: '44%', height: 13 };

interface KkMottoStageSkeletonProps {
  sx?: KkSx;
}

export const KkMottoStageSkeleton: FC<KkMottoStageSkeletonProps> = ({ sx }) => (
  <Stack
    aria-hidden
    data-kk-motto-stage-skeleton
    sx={[mottoStageChrome, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Stack sx={{ minWidth: 0, gap: MOTTO_STAGE_CONTENT_GAP }}>
      <Box sx={[skeletonSurface, { ...META_BAR, borderRadius: BAR_RADIUS }]} />
      <Stack sx={{ minWidth: 0, maxWidth: MOTTO_STAGE_TEXT_WIDTH, gap: MOTTO_STAGE_HEADLINE_GAP }}>
        {MOTTO_BARS.map((bar) => (
          <Box
            key={bar.key}
            sx={[
              skeletonSurface,
              { width: bar.width, height: bar.height, borderRadius: BAR_RADIUS },
            ]}
          />
        ))}
        <Box sx={[skeletonSurface, { ...COUNTDOWN_BAR, borderRadius: BAR_RADIUS }]} />
      </Stack>
    </Stack>
  </Stack>
);
