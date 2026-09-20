import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkMottoStageSceneProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkMottoStageScene: FC<KkMottoStageSceneProps> = ({ sx, children }) => (
  <Box
    aria-hidden
    data-kk-motto-stage-scene
    sx={[
      {
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
