import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MatcherStepBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack aria-live="polite" sx={{ gap: { xs: 3, md: 4 } }}>
    {children}
  </Stack>
);
