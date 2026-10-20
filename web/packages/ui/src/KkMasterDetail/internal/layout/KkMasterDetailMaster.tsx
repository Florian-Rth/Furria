import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

export type KkMasterDetailSpan = 4 | 5 | 7 | 8 | 12;

interface KkMasterDetailMasterProps extends PropsWithChildren {
  span: KkMasterDetailSpan;
  sx?: KkSx;
}

export const KkMasterDetailMaster: FC<KkMasterDetailMasterProps> = ({ span, sx, children }) => (
  <Grid
    size={{ xs: 12, lg: span }}
    data-kk-master-detail-master
    sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Grid>
);
