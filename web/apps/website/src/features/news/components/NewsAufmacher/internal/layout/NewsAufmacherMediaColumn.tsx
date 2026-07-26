import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const NewsAufmacherMediaColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-news-aufmacher-media size={{ xs: 12, md: 6 }}>
    {children}
  </Grid>
);
