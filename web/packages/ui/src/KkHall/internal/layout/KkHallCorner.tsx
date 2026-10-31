import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkHallCorner: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ position: 'absolute', top: 0, left: 0, zIndex: 3, gap: 1 }}>
    {children}
  </Stack>
);
