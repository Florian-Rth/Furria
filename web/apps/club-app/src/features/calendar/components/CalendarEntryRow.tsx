import { KkChip, KkFactRow, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { RUNNING_CHIP_LABEL, toEntryMetaLine } from '../calendar-labels';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceRow } from './CalendarAttendanceRow';

interface CalendarEntryRowProps {
  entry: CalendarEntry;
}

export const CalendarEntryRow: FC<CalendarEntryRowProps> = ({ entry }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = entry.isRunning ? (
    <KkChip tone="accent" size="small" dot live>
      {RUNNING_CHIP_LABEL}
    </KkChip>
  ) : undefined;
  const actions = entry.asksForResponse ? <CalendarAttendanceRow entry={entry} /> : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toEntryMetaLine(entry);

  if (entry.description === null) {
    return (
      <KkFactRow
        title={entry.title}
        span={span}
        spanLabel={spanLabel}
        meta={meta}
        tone={tone}
        chip={chip}
        actions={actions}
      />
    );
  }

  return (
    <KkFactRow
      title={entry.title}
      span={span}
      spanLabel={spanLabel}
      meta={meta}
      tone={tone}
      chip={chip}
      actions={actions}
    >
      <KkText variant="body2" tone="secondary">
        {entry.description}
      </KkText>
    </KkFactRow>
  );
};
