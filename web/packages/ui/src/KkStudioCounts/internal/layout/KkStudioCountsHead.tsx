import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioCountsHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);
