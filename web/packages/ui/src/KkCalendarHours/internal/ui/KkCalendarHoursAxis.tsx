import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { HOURS_COLUMNS } from '../calendar-hours-paint';
import { useCalendarHours } from '../logic/calendar-hours-context';
import { hoursTicksOf } from '../logic/calendar-hours-geometry';

const { calendarHours, type } = kkTokens;
const PERCENT = 100;
const LABEL_NUDGE = 3;

export const KkCalendarHoursAxis: FC = () => {
  const { axis, trackWidth, measureTrack } = useCalendarHours();
  const ticks = hoursTicksOf(axis, trackWidth, calendarHours.hourLabelMinPx).flatMap((tick) =>
    tick.label === null
      ? []
      : [
          <Typography
            key={tick.hour}
            component="span"
            variant="caption"
            sx={{
              position: 'absolute',
              left: `${tick.share * PERCENT}%`,
              bottom: 0,
              ml: `${LABEL_NUDGE}px`,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: type.tracking.tight,
              lineHeight: calendarHours.axisRow,
              color: 'text.secondary',
            }}
          >
            {tick.label}
          </Typography>,
        ],
  );

  return (
    <Box
      aria-hidden
      data-kk-calendar-hours-axis
      sx={{
        display: 'grid',
        gridTemplateColumns: HOURS_COLUMNS,
        height: calendarHours.axisRow,
        mt: 0.5,
      }}
    >
      <Box />
      <Box ref={measureTrack} sx={{ position: 'relative', minWidth: 0 }}>
        {ticks}
      </Box>
    </Box>
  );
};
