import Box from '@mui/material/Box';
import type { FC } from 'react';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import { kkTokens } from '../tokens';
import { KkScreenHeaderMeta } from './internal/layout/KkScreenHeaderMeta';
import { KkScreenHeaderRoot } from './internal/layout/KkScreenHeaderRoot';
import { KkScreenHeaderText } from './internal/layout/KkScreenHeaderText';
import { KkScreenHeaderVisual } from './internal/layout/KkScreenHeaderVisual';

const BAR_RADIUS = `${kkTokens.radius.pill}px`;
const AVATAR_SIZE = 56;
const EYEBROW_BAR = { width: 84, height: 12 };
const TITLE_BAR = { width: 200, maxWidth: '100%', height: 30 };
const CHIP_BAR = { width: 96, height: 26 };

export const KkScreenHeaderSkeleton: FC = () => (
  <Box aria-hidden data-kk-screen-header-skeleton sx={{ minWidth: 0 }}>
    <KkScreenHeaderRoot>
      <KkScreenHeaderVisual>
        <Box
          sx={[skeletonSurface, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: '50%' }]}
        />
      </KkScreenHeaderVisual>
      <KkScreenHeaderText>
        <Box sx={[skeletonSurface, { ...EYEBROW_BAR, borderRadius: BAR_RADIUS }]} />
        <Box sx={[skeletonSurface, { ...TITLE_BAR, borderRadius: BAR_RADIUS }]} />
        <KkScreenHeaderMeta>
          <Box sx={[skeletonSurface, { ...CHIP_BAR, borderRadius: BAR_RADIUS }]} />
        </KkScreenHeaderMeta>
      </KkScreenHeaderText>
    </KkScreenHeaderRoot>
  </Box>
);
