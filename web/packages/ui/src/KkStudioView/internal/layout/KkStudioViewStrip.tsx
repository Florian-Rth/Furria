import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const SHORT = '@container kk-practice (max-height: 40rem)';

export const KkStudioViewStrip: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-strip
    sx={{
      position: 'relative',
      display: 'grid',
      gridTemplateAreas: '"strip"',
      minWidth: 0,
      height: { xs: '5.625rem', desktop: '5.875rem' },
      [SHORT]: { height: '4rem' },
    }}
  >
    {children}
  </Box>
);
