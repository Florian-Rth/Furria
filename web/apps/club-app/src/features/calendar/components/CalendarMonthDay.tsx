import type { KkSx } from '@furria/ui';
import { KkGroupToneDot, KkHeading, KkPanel, KkVisuallyHidden } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MonthGridDay } from '@/lib/calendar-days';
import { toDayEntriesLabel } from '../calendar-labels';

const NO_ENTRIES = 0;
const NO_TONES = 0;
const MARKER_SX = { alignItems: 'center', justifyContent: 'center', gap: 0.5 } as const;

interface CalendarMonthDayProps {
  day: MonthGridDay;
  onSelect: (isoDay: string) => void;
  sx?: KkSx;
}

export const CalendarMonthDay: FC<CalendarMonthDayProps> = ({ day, onSelect, sx }) => {
  const select = (): void => {
    onSelect(day.isoDay);
  };

  const tone = day.selected ? 'raised' : 'cream';
  const headingTone = day.isToday ? 'accent' : 'default';
  const toneDots = day.tones.map((groupTone) => (
    <KkGroupToneDot key={groupTone} tone={groupTone} />
  ));
  const dots = toneDots.length === NO_TONES ? <KkGroupToneDot tone={null} /> : toneDots;
  const marker =
    day.entryCount === NO_ENTRIES ? null : (
      <Stack direction="row" sx={MARKER_SX}>
        {dots}
        <KkVisuallyHidden>{toDayEntriesLabel(day.entryCount)}</KkVisuallyHidden>
      </Stack>
    );

  return (
    <KkPanel
      tone={tone}
      chevron={false}
      dimmed={!day.inMonth}
      onClick={select}
      sx={[
        { px: 0, py: 0.75, alignItems: 'center', gap: 0.25 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkHeading level={6} tone={headingTone}>
        {day.dayNumber}
      </KkHeading>
      {marker}
    </KkPanel>
  );
};
