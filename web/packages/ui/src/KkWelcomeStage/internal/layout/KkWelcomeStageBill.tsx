import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkWelcomeStageBillProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkWelcomeStageBill: FC<KkWelcomeStageBillProps> = ({ sx, children }) => (
  <Stack
    sx={[{ flex: 1, minHeight: 0, rowGap: 1.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
