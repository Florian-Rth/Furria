import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { crossFade, PLAYER_LAYER } from '../player-paint';

interface KkStudioDPlayerFrameProps extends PropsWithChildren {
  shown: boolean;
}

export const KkStudioDPlayerFrame: FC<KkStudioDPlayerFrameProps> = ({ shown, children }) => (
  <Box
    aria-hidden={!shown}
    data-kk-studio-d-frame={shown ? 'shown' : 'hidden'}
    sx={{
      position: 'absolute',
      inset: 0,
      zIndex: PLAYER_LAYER.frame,
      pointerEvents: 'none',
      ...crossFade(shown),
    }}
  >
    {children}
  </Box>
);
