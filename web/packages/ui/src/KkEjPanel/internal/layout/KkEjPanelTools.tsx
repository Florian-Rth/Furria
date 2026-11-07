import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEjPanelTools: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, minWidth: 0 }}>
    {children}
  </Stack>
);
