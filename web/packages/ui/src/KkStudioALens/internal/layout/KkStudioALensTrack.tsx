import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioALensTrackProps extends PropsWithChildren {
  offset: number;
  width: number;
}

export const KkStudioALensTrack: FC<KkStudioALensTrackProps> = ({ offset, width, children }) => (
  <Box
    aria-hidden
    data-kk-studio-a-lens-track
    style={{ width: `${width}px`, transform: `translate3d(calc(50cqw - ${offset}px), 0, 0)` }}
    sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, willChange: 'transform' }}
  >
    {children}
  </Box>
);
