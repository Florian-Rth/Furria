import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';

const WIDE = '@container kk-studio-e (min-aspect-ratio: 5/4)';
const WIDE_TALL = '@container kk-studio-e (min-aspect-ratio: 5/4) and (min-height: 34rem)';
const SIDE = 'clamp(18rem, 34cqw, 30rem)';
const COMPOSED_HEIGHT = `min(100%, calc((100cqw - ${SIDE} - 2rem) * 9 / 16 + 10rem))`;
const BLED_WIDTH = `(100cqw + ${trackEdgeOf('left')} + ${trackEdgeOf('right')})`;
const HERO_ROW = `min(calc(${BLED_WIDTH} * 3 / 4), max(calc(${BLED_WIDTH} * 9 / 16), calc(100cqh - 30rem)))`;

interface KkStudioEViewRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioEViewRoot: FC<KkStudioEViewRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-studio-e
    sx={[
      {
        width: '100%',
        maxWidth: { desktop: '86rem' },
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        mx: 'auto',
        containerType: 'size',
        containerName: 'kk-studio-e',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"head" "hero" "side" "controls"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: `auto minmax(0, ${HERO_ROW}) minmax(0, 1fr) auto`,
        rowGap: { xs: 1.5, desktop: 2 },
        columnGap: { xs: 2, desktop: 4 },
        [WIDE]: {
          gridTemplateAreas: '"hero head" "hero side" "hero controls"',
          gridTemplateColumns: `minmax(0, 1fr) ${SIDE}`,
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
        },
        [WIDE_TALL]: {
          gridTemplateAreas: '"hero head" "hero side" "controls side"',
          height: COMPOSED_HEIGHT,
          mt: `calc((100cqh - ${COMPOSED_HEIGHT}) / 2)`,
        },
      }}
    >
      {children}
    </Box>
  </Box>
);
