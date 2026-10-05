import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ConfirmScreenActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-confirm-actions
    sx={{ gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap', alignItems: 'center' }}
  >
    {children}
  </Stack>
);
