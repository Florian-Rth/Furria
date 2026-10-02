import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import { KkScreenHeaderRoot } from '../KkScreenHeader/internal/layout/KkScreenHeaderRoot';
import { kkTokens } from '../tokens';
import { useGreetingWait } from './internal/logic/use-greeting-wait';

const SKELETON_FRAME: CSSObject = { minWidth: 0, maxWidth: kkTokens.measure.text };
const LINES_FRAME: CSSObject = { minWidth: 0, flex: 1, typography: 'h1', lineHeight: 1.1 };
const BAR_FRAME: CSSObject = { height: '1lh', py: 0.5 };
const BAR: CSSObject = { height: '100%', borderRadius: `${kkTokens.radius.bar}px` };
const FIRST_LINE: CSSObject = { width: '80%' };
const SECOND_LINE: CSSObject = { width: '55%' };

export const KkGreetingSkeleton: FC = () => {
  useGreetingWait();

  return (
    <Box aria-hidden data-kk-greeting-skeleton sx={SKELETON_FRAME}>
      <KkScreenHeaderRoot>
        <Box sx={LINES_FRAME}>
          <Box sx={BAR_FRAME}>
            <Box sx={[skeletonSurface, BAR, FIRST_LINE]} />
          </Box>
          <Box sx={BAR_FRAME}>
            <Box sx={[skeletonSurface, BAR, SECOND_LINE]} />
          </Box>
        </Box>
      </KkScreenHeaderRoot>
    </Box>
  );
};
