import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormAside: FC<PropsWithChildren> = ({ children }) => (
  <Grid size={{ xs: 12, desktop: 5 }}>
    <Stack sx={{ gap: { xs: 2, md: 2.5 } }}>{children}</Stack>
  </Grid>
);
