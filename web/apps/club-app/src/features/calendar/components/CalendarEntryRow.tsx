import { KkChip, KkFactRow, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { RUNNING_CHIP_LABEL, toEntryMetaLine } from '../calendar-labels';
import type { CalendarEntry } from '../schemas';
import { CalendarEntryActions } from './CalendarEntryActions';

interface CalendarEntryRowProps {
  entry: CalendarEntry;
  owned: boolean;
  onEdit: (calendarEntryId: number) => void;
  onDelete: (calendarEntryId: number) => void;
}

export const CalendarEntryRow: FC<CalendarEntryRowProps> = ({ entry, owned, onEdit, onDelete }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = entry.isRunning ? (
    <KkChip tone="accent" size="small" dot live>
      {RUNNING_CHIP_LABEL}
    </KkChip>
  ) : undefined;
  const actions =
    entry.asksForResponse || owned ? (
      <CalendarEntryActions entry={entry} owned={owned} onEdit={onEdit} onDelete={onDelete} />
    ) : undefined;
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
