import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPaneLayoutMainProps extends PropsWithChildren {
  withPane: boolean;
}

export const KkPaneLayoutMain: FC<KkPaneLayoutMainProps> = ({ withPane, children }) => (
  <Grid size={{ xs: 12, md: withPane ? 7 : 12, lg: withPane ? 8 : 12 }} sx={{ minWidth: 0 }}>
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>{children}</Stack>
  </Grid>
);
