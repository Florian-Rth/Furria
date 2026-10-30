import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAgendaRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAgendaRoot: FC<KkAgendaRootProps> = ({ sx, children }) => (
  <Stack data-kk-agenda sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);
