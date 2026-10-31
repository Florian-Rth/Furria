import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioDeskLine: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-studio-desk-line sx={{ gap: 0.5 }}>
    {children}
  </Stack>
);
