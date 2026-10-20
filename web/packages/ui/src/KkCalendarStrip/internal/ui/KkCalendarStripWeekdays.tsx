import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KK_CALENDAR_STICKY } from '../../calendar-sticky';

interface KkCalendarStripWeekdaysProps {
  weekdays: readonly string[];
  sx?: KkSx;
}

export const KkCalendarStripWeekdays: FC<KkCalendarStripWeekdaysProps> = ({ weekdays, sx }) => {
  const heads = weekdays.map((weekday) => (
    <Typography
      key={weekday}
      component="span"
      variant="caption"
      sx={{
        textAlign: 'center',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: kkTokens.type.tracking.label,
        color: 'text.secondary',
      }}
    >
      {weekday}
    </Typography>
  ));

  return (
    <Box
      aria-hidden
      data-kk-calendar-strip-weekdays
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          alignItems: 'center',
          height: `${KK_CALENDAR_STICKY.stripWeekdays}px`,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {heads}
    </Box>
  );
};
