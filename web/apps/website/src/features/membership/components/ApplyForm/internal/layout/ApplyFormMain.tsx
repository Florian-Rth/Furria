import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormMain: FC<PropsWithChildren> = ({ children }) => (
  <Grid size={{ xs: 12, desktop: 7 }}>
    <Stack sx={{ gap: { xs: 4, md: 5 } }}>{children}</Stack>
  </Grid>
);
