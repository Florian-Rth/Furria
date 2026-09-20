import type { KkSx } from '@furria/ui';
import { KkChip, KkHeading, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { MonthGridDay } from '@/lib/calendar-days';

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
  const marker = day.entryCount === 0 ? null : <KkChip tone="accent" size="small" dot />;

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
