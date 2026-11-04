import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../../kk-sx';

interface KkPourPageBodyProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkPourPageBody: FC<KkPourPageBodyProps> = ({ children, sx }) => (
  <Stack
    sx={[
      { position: 'relative', flex: 1, justifyContent: 'center', gap: 2, minWidth: 0, py: 2 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
