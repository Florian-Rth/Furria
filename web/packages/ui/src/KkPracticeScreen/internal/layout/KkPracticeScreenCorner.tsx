import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeScreenCorner: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ position: 'absolute', top: 0, right: 0, zIndex: 2, p: 0.75, gap: 0.5 }}
  >
    {children}
  </Stack>
);
