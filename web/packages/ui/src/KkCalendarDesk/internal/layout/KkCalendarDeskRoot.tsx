import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarDeskRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDeskRoot: FC<KkCalendarDeskRootProps> = ({ sx, children }) => (
  <Grid
    container
    columnSpacing={3}
    data-kk-calendar-desk
    sx={[{ alignItems: 'flex-start', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Grid>
);
