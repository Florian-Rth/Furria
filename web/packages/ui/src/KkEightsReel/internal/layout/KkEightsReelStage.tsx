import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEightsReelStage: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    sx={{
      flex: 1,
      minHeight: '7rem',
      position: 'relative',
    }}
  >
    {children}
  </Stack>
);
