import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkTallyStripBar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-tally-strip-bar
    sx={{ alignItems: 'center', gap: { xs: 1, md: 2 }, minWidth: 0, px: { xs: 1, md: 1.5 }, py: 1 }}
  >
    {children}
  </Stack>
);
