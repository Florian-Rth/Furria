import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkBulletinHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkBulletinHead: FC<KkBulletinHeadProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
