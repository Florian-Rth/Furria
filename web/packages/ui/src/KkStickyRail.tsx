import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkStickyRailProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStickyRail: FC<KkStickyRailProps> = ({ sx, children }) => (
  <Stack
    data-kk-sticky-rail
    sx={[
      {
        display: { xs: 'contents', desktop: 'block' },
        position: 'sticky',
        top: `${kkTokens.layout.stickyTop}px`,
        alignSelf: 'flex-start',
        maxHeight: '100dvh',
        overflowY: 'auto',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
