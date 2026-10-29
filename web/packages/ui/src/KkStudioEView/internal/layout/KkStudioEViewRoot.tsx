import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';

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
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr) auto auto',
        rowGap: { xs: 1.5, desktop: 2.5 },
        width: '100%',
        maxWidth: { desktop: '72rem' },
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        mx: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
