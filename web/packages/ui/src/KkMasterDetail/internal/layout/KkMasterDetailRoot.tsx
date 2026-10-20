import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkMasterDetailRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkMasterDetailRoot: FC<KkMasterDetailRootProps> = ({ sx, children }) => (
  <Grid
    container
    columnSpacing={3}
    rowSpacing={2.5}
    data-kk-master-detail
    sx={[{ alignItems: 'flex-start', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Grid>
);
