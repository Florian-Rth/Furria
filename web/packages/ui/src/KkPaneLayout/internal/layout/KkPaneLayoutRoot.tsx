import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const KkPaneLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    container
    columnSpacing={2.5}
    rowSpacing={2}
    data-kk-pane-layout
    sx={{ alignItems: 'flex-start', minWidth: 0 }}
  >
    {children}
  </Grid>
);
