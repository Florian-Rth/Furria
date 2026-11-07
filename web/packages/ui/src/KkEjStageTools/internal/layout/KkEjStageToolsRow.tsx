import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEjStageToolsRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ gap: 0.5, minWidth: 0, '& > *': { flex: '1 1 0', minWidth: '4.25rem' } }}
  >
    {children}
  </Stack>
);
