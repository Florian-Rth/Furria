import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormBlock: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="fieldset"
    data-kk-apply-block
    sx={{ gap: { xs: 1.5, md: 2 }, border: 'none', minWidth: 0, m: 0, p: 0 }}
  >
    {children}
  </Stack>
);
