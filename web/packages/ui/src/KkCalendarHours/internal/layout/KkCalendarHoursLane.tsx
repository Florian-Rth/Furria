import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { kkTokens } from '../../../tokens';
import {
  HOURS_COLUMNS,
  hoursCarnivalWash,
  hoursHalo,
  hoursTodayWash,
} from '../calendar-hours-paint';
import type { KkCalendarHoursTint } from '../logic/calendar-hours-types';

const { calendarHours, line } = kkTokens;

const TINTS: Record<KkCalendarHoursTint, (theme: Theme) => CSSObject> = {
  none: () => ({}),
  today: (theme) => ({ ...hoursTodayWash(theme), ...hoursHalo(theme) }),
  carnival: hoursCarnivalWash,
};

const trackPaint =
  (rows: number, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    minWidth: 0,
    height: quiet
      ? calendarHours.quietLane
      : `calc(${rows} * ${calendarHours.row} + ${(rows - 1) * calendarHours.rowGap}px + ${theme.spacing(calendarHours.lanePad * 2)})`,
  });

const lanePaint =
  (tint: KkCalendarHoursTint, selected: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    alignItems: 'stretch',
    borderTop: `${line.hair}px solid ${(theme.vars ?? theme).palette.divider}`,
    ...TINTS[tint](theme),
    ...(selected
      ? { boxShadow: `inset ${line.page}px 0 0 ${(theme.vars ?? theme).palette.text.primary}` }
      : {}),
  });

interface KkCalendarHoursLaneProps {
  label: string;
  head: ReactNode;
  rows: number;
  quiet: boolean;
  tint: KkCalendarHoursTint;
  selected: boolean;
  children?: ReactNode;
}

export const KkCalendarHoursLane: FC<KkCalendarHoursLaneProps> = ({
  label,
  head,
  rows,
  quiet,
  tint,
  selected,
  children,
}) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-calendar-hours-lane
    sx={[{ display: 'grid', gridTemplateColumns: HOURS_COLUMNS }, lanePaint(tint, selected)]}
  >
    <Box sx={{ minWidth: 0, display: 'grid' }}>{head}</Box>
    <Box sx={trackPaint(rows, quiet)}>{children}</Box>
  </Box>
);
