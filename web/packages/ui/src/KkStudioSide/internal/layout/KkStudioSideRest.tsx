import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const ROOMY = '@container (min-height: 22rem)';

export const KkStudioSideRest: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-side-rest
    sx={{
      position: 'relative',
      flex: 1,
      minHeight: 0,
      display: 'none',
      [ROOMY]: { display: 'block' },
    }}
  >
    {children}
  </Box>
);
