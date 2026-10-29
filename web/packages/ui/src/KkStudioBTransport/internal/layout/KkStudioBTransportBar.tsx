import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioBTransportBarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStudioBTransportBar: FC<KkStudioBTransportBarProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[{ alignItems: 'center', gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
