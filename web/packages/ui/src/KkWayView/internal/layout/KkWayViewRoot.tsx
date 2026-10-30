import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';
import { WAY_SIDE, WAY_WIDE, WAY_WIDE_TALL } from '../logic/way-view-query';

interface KkWayViewRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkWayViewRoot: FC<KkWayViewRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-way
    sx={[
      {
        width: '100%',
        maxWidth: { desktop: '92rem' },
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        mx: 'auto',
        containerType: 'size',
        containerName: 'kk-way',
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
        gridTemplateAreas: '"head" "note" "hero" "ribbon" "keys"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
        rowGap: { xs: 1.25, desktop: 2 },
        columnGap: { xs: 2.5, desktop: 4 },
        [WAY_WIDE]: {
          gridTemplateAreas: '"hero head" "hero note" "hero keys" "ribbon ribbon"',
          gridTemplateColumns: `minmax(0, 1fr) ${WAY_SIDE}`,
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
        },
        [WAY_WIDE_TALL]: {
          gridTemplateAreas: '"hero head" "hero note" "hero side" "hero keys" "ribbon ribbon"',
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
        },
      }}
    >
      {children}
    </Box>
  </Box>
);
