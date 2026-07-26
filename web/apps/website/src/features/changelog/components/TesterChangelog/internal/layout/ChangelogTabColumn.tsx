import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const ChangelogTabColumn: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      flexShrink: 0,
      minWidth: 0,
      width: { md: '33%' },
      pb: { xs: 2, md: 0 },
      pr: { md: 2 },
      borderBottom: { xs: 1, md: 0 },
      borderRight: { md: 1 },
      borderColor: 'divider',
    }}
  >
    {children}
  </Box>
);
