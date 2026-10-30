import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

const WIDE = '@container kk-studio-h (min-aspect-ratio: 5/4)';
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const ROW = '3.5rem';
const RAIL = '5.75rem';

export const KkStudioHViewTools: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-h-tools-area
    sx={{
      gridArea: 'tools',
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      height: 0,
      mt: { xs: -1.5, desktop: -2 },
      ml: `calc(-1 * ${trackEdgeOf('left')})`,
      mr: `calc(-1 * ${trackEdgeOf('right')})`,
      overflow: 'clip',
      opacity: 0,
      visibility: 'hidden',
      transition: `height 380ms ${EASE}, margin 380ms ${EASE}, opacity 260ms ease-out, visibility 0s linear 380ms`,
      '[data-editing="true"] &': {
        height: ROW,
        mt: 0,
        opacity: 1,
        visibility: 'visible',
        transition: `height 380ms ${EASE}, margin 380ms ${EASE}, opacity 260ms ease-out 120ms, visibility 0s`,
      },
      [WIDE]: {
        height: 'auto',
        mt: 0,
        ml: 0,
        width: 0,
        mr: { xs: -2, desktop: -3 },
        transition: `width 380ms ${EASE}, margin 380ms ${EASE}, opacity 260ms ease-out, visibility 0s linear 380ms`,
        '[data-editing="true"] &': {
          height: 'auto',
          width: RAIL,
          mr: 0,
          transition: `width 380ms ${EASE}, margin 380ms ${EASE}, opacity 260ms ease-out 120ms, visibility 0s`,
        },
      },
    }}
  >
    {children}
  </Box>
);
