import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkMomentFieldRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkMomentFieldRoot: FC<KkMomentFieldRootProps> = ({ sx, children }) => (
  <Stack data-kk-moment-field sx={[{ minWidth: 0, gap: 0.75 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);
