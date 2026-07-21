import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const TeaserStage: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="main"
    sx={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 4,
      px: 3,
      py: 10,
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}
  >
    {children}
  </Stack>
);
