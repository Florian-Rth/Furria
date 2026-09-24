import { KkFactRow, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { toCalendarEntryMark, toCalendarEntryMetaLine } from '../group-calendar-entries';
import type { GroupCalendarEntry } from '../schemas';
import { HubCalendarEntryAnswers } from './HubCalendarEntryAnswers';
import { HubCalendarEntryMark } from './HubCalendarEntryMark';

interface HubCalendarEntryRowProps {
  groupId: number;
  entry: GroupCalendarEntry;
  canAnswer: boolean;
}

export const HubCalendarEntryRow: FC<HubCalendarEntryRowProps> = ({
  groupId,
  entry,
  canAnswer,
}) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = <HubCalendarEntryMark mark={toCalendarEntryMark(entry, groupId)} />;
  const actions =
    entry.asksForResponse && canAnswer ? (
      <HubCalendarEntryAnswers groupId={groupId} entry={entry} />
    ) : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toCalendarEntryMetaLine(entry, groupId);

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
