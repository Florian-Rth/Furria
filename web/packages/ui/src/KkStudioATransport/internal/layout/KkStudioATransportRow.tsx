import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioATransportRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
    {children}
  </Stack>
);
