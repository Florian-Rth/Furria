import type { KkCalendarDayData } from '@furria/ui/calendar-strip-types';
import { KkCalendarStrip } from '@furria/ui/KkCalendarStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  EXPAND_LABEL,
  MODE_LABELS,
  MODES_LABEL,
  NEXT_WEEK,
  PREVIOUS_WEEK,
  TODAY,
} from '../calendar-agenda-copy';

const SAMPLE_TITLE = 'November';
const SAMPLE_CAPTION = 'KW 48';
const SAMPLE_PAGE = 'help';
const WEEKDAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] as const;
const ONE_ROW = 1;
const FIRST_ROW = 0;

const sampleDay = (
  dayNumber: number,
  weekday: string,
  extras: Partial<KkCalendarDayData>,
): KkCalendarDayData => ({
  isoDay: `2026-11-${String(dayNumber).padStart(2, '0')}`,
  dayNumber,
  weekday,
  label: weekday,
  isToday: false,
  isPast: false,
  inMonth: true,
  selected: false,
  marks: [],
  usualMarks: [],
  owed: false,
  landmark: false,
  carnival: false,
  ...extras,
});

const SAMPLE_DAYS: readonly KkCalendarDayData[] = [
  sampleDay(23, 'MO', {}),
  sampleDay(24, 'DI', { isToday: true, selected: true, marks: ['club'] }),
  sampleDay(25, 'MI', {}),
  sampleDay(26, 'DO', { marks: ['club'], owed: true }),
  sampleDay(27, 'FR', {}),
  sampleDay(28, 'SA', { marks: ['club', 'club'] }),
  sampleDay(29, 'SO', {}),
];

const keep = (): void => {};

export const CalendarHelpWeekPreview: FC = () => {
  const days = SAMPLE_DAYS.map((day) => (
    <KkCalendarStrip.Day key={day.isoDay} day={day} onSelect={keep} />
  ));

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkCalendarStrip.Bar>
        <KkCalendarStrip.Title title={SAMPLE_TITLE} caption={SAMPLE_CAPTION} todayLabel={TODAY} />
        <KkCalendarStrip.Tools>
          <KkCalendarStrip.Modes
            label={MODES_LABEL}
            labels={MODE_LABELS}
            value="days"
            onChange={keep}
          />
          <KkCalendarStrip.Travel
            previousLabel={PREVIOUS_WEEK}
            nextLabel={NEXT_WEEK}
            onPrevious={keep}
            onNext={keep}
          />
          <KkCalendarStrip.Expand label={EXPAND_LABEL} expanded={false} onToggle={keep} />
        </KkCalendarStrip.Tools>
      </KkCalendarStrip.Bar>
      <KkCalendarStrip.Weekdays weekdays={WEEKDAYS} />
      <KkCalendarStrip.Weeks
        rows={ONE_ROW}
        focusRow={FIRST_ROW}
        open={false}
        pageKey={SAMPLE_PAGE}
        travel="none"
        onTravel={keep}
      >
        {days}
      </KkCalendarStrip.Weeks>
    </Stack>
  );
};
