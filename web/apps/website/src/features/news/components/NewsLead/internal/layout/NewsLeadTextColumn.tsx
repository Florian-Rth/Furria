import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const NewsLeadTextColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-news-lead-text
    size={{ xs: 12, md: 6 }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: { xs: 1.5, md: 2 },
    }}
  >
    {children}
  </Grid>
);
