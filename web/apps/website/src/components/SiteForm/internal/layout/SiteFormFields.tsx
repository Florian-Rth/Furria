import { kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const SiteFormFields: FC<PropsWithChildren> = ({ children }) => (
  <Grid container data-kk-site-form-fields spacing={kkTokens.layout.fieldGap}>
    {children}
  </Grid>
);
