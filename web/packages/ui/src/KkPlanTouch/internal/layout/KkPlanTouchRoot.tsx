import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';

interface KkPlanTouchRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPlanTouchRoot: FC<KkPlanTouchRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-plan-touch
    sx={[
      {
        display: 'grid',
        width: '100%',
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        gap: 1,
        gridTemplateAreas: '"top top" "canvas sheet" "dock dock"',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
        overscrollBehavior: 'none',
        touchAction: 'manipulation',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
