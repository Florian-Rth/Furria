import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OlderSessionRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-older-session-row sx={{ minWidth: 0 }}>
    {children}
  </Stack>
);
