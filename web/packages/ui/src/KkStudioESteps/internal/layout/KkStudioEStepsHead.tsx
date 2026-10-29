import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEStepsHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ alignItems: 'center', gap: 1, flexShrink: 0, pl: 2.5, pr: 1, py: { xs: 0, desktop: 1 } }}
  >
    {children}
  </Stack>
);
