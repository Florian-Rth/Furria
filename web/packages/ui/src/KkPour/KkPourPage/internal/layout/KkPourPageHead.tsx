import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../../kk-sx';

interface KkPourPageHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkPourPageHead: FC<KkPourPageHeadProps> = ({ children, sx }) => (
  <Stack component="header" sx={[{ gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);
