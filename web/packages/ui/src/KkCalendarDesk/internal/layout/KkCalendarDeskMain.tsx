import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarDeskMainProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDeskMain: FC<KkCalendarDeskMainProps> = ({ sx, children }) => (
  <Grid
    size={5}
    data-kk-calendar-desk-main
    sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Grid>
);
