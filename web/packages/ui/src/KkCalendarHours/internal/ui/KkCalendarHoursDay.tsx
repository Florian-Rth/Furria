import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';
import { hoursGoldInk } from '../calendar-hours-paint';
import type { KkCalendarHoursDayData } from '../logic/calendar-hours-types';

const { radius, type, calendarHours } = kkTokens;
const STAR = 9;

const STAR_PAINT: CSSObject = {
  width: STAR,
  height: STAR,
  flexShrink: 0,
  backgroundColor: 'warning.main',
  clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
};

const cellPaint = (theme: Theme): CSSObject => ({
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  minWidth: 0,
  pl: { xs: 0.75, md: 1.25 },
  pr: 0.5,
  textAlign: 'left',
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '5%') } },
  ...focusRing(theme),
});

const datePaint =
  (day: KkCalendarHoursDayData, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
    px: day.isToday ? 0.375 : 0,
    borderRadius: `${radius.bar}px`,
    alignSelf: quiet ? 'auto' : 'flex-start',
    ...(quiet ? { color: 'text.secondary' } : { color: 'text.primary' }),
    ...(day.mark === null || day.isToday ? {} : hoursGoldInk(theme)),
    ...(day.isToday ? { backgroundColor: 'primary.main', color: 'primary.contrastText' } : {}),
  });

interface KkCalendarHoursDayProps {
  day: KkCalendarHoursDayData;
  quiet: boolean;
  onSelect: (isoDay: string) => void;
}

export const KkCalendarHoursDay: FC<KkCalendarHoursDayProps> = ({ day, quiet, onSelect }) => {
  const select = (): void => {
    onSelect(day.isoDay);
  };

  const mark =
    day.mark === null ? null : (
      <Stack
        direction="row"
        sx={(theme) => ({ alignItems: 'center', gap: 0.5, minWidth: 0, ...hoursGoldInk(theme) })}
      >
        <Box aria-hidden component="span" sx={STAR_PAINT} />
        <Typography
          component="span"
          variant="caption"
          noWrap
          sx={{
            display: { xs: 'none', md: 'block' },
            fontWeight: 800,
            color: 'inherit',
            lineHeight: 1.2,
          }}
        >
          {day.markLabel}
        </Typography>
      </Stack>
    );

  return (
    <ButtonBase
      aria-label={day.label}
      aria-pressed={day.selected}
      data-kk-calendar-hours-day={day.isoDay}
      onClick={select}
      sx={cellPaint}
    >
      <Stack
        direction={quiet ? 'row' : 'column'}
        sx={{
          justifyContent: quiet ? 'flex-start' : 'center',
          alignSelf: 'center',
          alignItems: quiet ? 'baseline' : 'flex-start',
          gap: quiet ? 0.5 : 0.125,
          minWidth: 0,
          width: '100%',
          minHeight: calendarHours.quietLane,
        }}
      >
        <Typography
          component="span"
          variant="overline"
          sx={{
            fontWeight: 900,
            letterSpacing: type.tracking.label,
            lineHeight: 1.1,
            color: day.isToday ? 'primary.main' : 'text.secondary',
          }}
        >
          {day.weekday}
        </Typography>
        <Typography component="span" variant={quiet ? 'caption' : 'h4'} sx={datePaint(day, quiet)}>
          {day.dateLabel}
        </Typography>
        {mark}
      </Stack>
    </ButtonBase>
  );
};
