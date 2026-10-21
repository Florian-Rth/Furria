import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarAgendaRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkCalendarAgendaRoot: FC<KkCalendarAgendaRootProps> = ({ label, sx, children }) => (
  <Stack
    aria-label={label}
    data-kk-calendar-agenda
    sx={[{ minWidth: 0, gap: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
