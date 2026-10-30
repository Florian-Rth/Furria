import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGTransportEnd: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'flex-end', alignItems: 'center', gap: 0.25, minWidth: 0 }}
  >
    {children}
  </Stack>
);
