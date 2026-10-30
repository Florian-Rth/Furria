import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { PERCENT } from '../lane-heights';

interface KkFocusLanesTrackProps extends PropsWithChildren {
  scale: number;
  shift: number;
}

export const KkFocusLanesTrack: FC<KkFocusLanesTrackProps> = ({ scale, shift, children }) => (
  <Box
    data-kk-studio-track
    style={{
      width: `${scale * PERCENT}%`,
      transform: `translate3d(${-shift * PERCENT}%, 0, 0)`,
    }}
    sx={{ position: 'relative', willChange: 'transform' }}
  >
    {children}
  </Box>
);
