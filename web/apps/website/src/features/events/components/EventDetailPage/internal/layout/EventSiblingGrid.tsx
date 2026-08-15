import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const EventSiblingGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid container data-kk-event-siblings spacing={{ xs: 2, md: 3 }}>
    {children}
  </Grid>
);
