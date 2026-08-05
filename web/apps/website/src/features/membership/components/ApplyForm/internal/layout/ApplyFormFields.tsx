import { kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormFields: FC<PropsWithChildren> = ({ children }) => (
  <Grid container data-kk-apply-fields spacing={kkTokens.layout.fieldGap}>
    {children}
  </Grid>
);
