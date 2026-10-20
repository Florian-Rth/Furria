import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { calendarSurface } from '../../../KkCalendarStrip/calendar-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkCalendarAgendaPanelProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarAgendaPanel: FC<KkCalendarAgendaPanelProps> = ({ sx, children }) => (
  <Stack
    component="ol"
    data-kk-calendar-panel
    sx={[
      (theme) => ({
        ...calendarSurface(),
        listStyle: 'none',
        m: 0,
        p: 0,
        minWidth: 0,
        containerType: 'inline-size',
        perspective: '900px',
        '& > li + li': {
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: (theme.vars ?? theme).palette.divider,
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
