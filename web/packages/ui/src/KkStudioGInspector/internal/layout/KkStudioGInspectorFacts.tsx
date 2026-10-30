import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGInspectorFacts: FC<PropsWithChildren> = ({ children }) => (
  <Box
    component="dl"
    data-kk-studio-g-facts
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(5.75rem, 1fr))',
      columnGap: 1.25,
      rowGap: 1,
      m: 0,
    }}
  >
    {children}
  </Box>
);
