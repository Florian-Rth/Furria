import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';

interface KkPlanDeskRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPlanDeskRoot: FC<KkPlanDeskRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-plan-desk
    sx={[
      (theme) => ({
        display: 'grid',
        width: '100%',
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        gap: 1,
        gridTemplateAreas: '"status" "canvas" "rail"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
        overscrollBehavior: 'contain',
        [theme.breakpoints.up('desktop')]: {
          gap: 1.5,
          gridTemplateAreas: '"rail status inspector" "rail canvas inspector"',
          gridTemplateColumns: 'auto minmax(0, 1fr) minmax(17rem, 20rem)',
          gridTemplateRows: 'auto minmax(0, 1fr)',
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
