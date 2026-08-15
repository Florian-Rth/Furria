import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const EventSiblingCell: FC<PropsWithChildren> = ({ children }) => (
  <Grid size={{ xs: 12, sm: 6, desktop: 4 }} sx={{ display: 'flex' }}>
    {children}
  </Grid>
);
