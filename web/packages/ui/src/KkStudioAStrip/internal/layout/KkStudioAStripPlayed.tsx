import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const PERCENT = 100;

interface KkStudioAStripPlayedProps extends PropsWithChildren {
  fraction: number;
}

export const KkStudioAStripPlayed: FC<KkStudioAStripPlayedProps> = ({ fraction, children }) => (
  <Box
    aria-hidden
    style={{ clipPath: `inset(0 ${(1 - fraction) * PERCENT}% 0 0)` }}
    sx={{ position: 'absolute', inset: 0 }}
  >
    {children}
  </Box>
);
