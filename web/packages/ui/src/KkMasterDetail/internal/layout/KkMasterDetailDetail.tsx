import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { STICKY_HEAD_TOP } from '../../../KkStatePill/state-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkMasterDetailSpan } from './KkMasterDetailMaster';

const STICKY_FOOT = kkTokens.shell.navHeight + kkTokens.shell.gutter * 2;

interface KkMasterDetailDetailProps extends PropsWithChildren {
  span: KkMasterDetailSpan;
  sx?: KkSx;
}

export const KkMasterDetailDetail: FC<KkMasterDetailDetailProps> = ({ span, sx, children }) => (
  <Grid
    size={{ xs: 12, lg: span }}
    data-kk-master-detail-detail
    sx={[
      {
        minWidth: 0,
        position: { lg: 'sticky' },
        top: { lg: STICKY_HEAD_TOP },
        maxHeight: { lg: `calc(100dvh - ${STICKY_HEAD_TOP + STICKY_FOOT}px)` },
        overflowY: { lg: 'auto' },
        overscrollBehavior: 'contain',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Grid>
);
