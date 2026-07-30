import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormFields: FC<PropsWithChildren> = ({ children }) => (
  <Grid container data-kk-apply-fields spacing={{ xs: 2, md: 2.5 }}>
    {children}
  </Grid>
);
