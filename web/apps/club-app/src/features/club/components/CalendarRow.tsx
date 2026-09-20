import { KkChip, KkFactRow } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import type { ClubCalendarEntry } from '../schemas';

const RUNNING_CHIP_LABEL = 'läuft gerade';

interface CalendarRowProps {
  entry: ClubCalendarEntry;
}

export const CalendarRow: FC<CalendarRowProps> = ({ entry }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = entry.isRunning ? (
    <KkChip tone="accent" size="small" dot live>
      {RUNNING_CHIP_LABEL}
    </KkChip>
  ) : undefined;
  const venue = entry.venueName ?? undefined;

  return (
    <KkFactRow
      title={entry.title}
      span={toDayNumberLabel(entry.startsAt)}
      spanLabel={toWeekdayEyebrow(entry.startsAt)}
      meta={venue}
      tone={tone}
      chip={chip}
    />
  );
};
