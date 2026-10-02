import { KkFactRow, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { toCalendarEntryMark, toCalendarEntryMetaLine } from '../group-calendar-entries';
import type { GroupCalendarEntry } from '../schemas';
import { HubCalendarEntryAnswerChoice } from './HubCalendarEntryAnswerChoice';
import { HubCalendarEntryMark } from './HubCalendarEntryMark';

interface HubCalendarEntryRowProps {
  groupId: number;
  entry: GroupCalendarEntry;
}

export const HubCalendarEntryRow: FC<HubCalendarEntryRowProps> = ({ groupId, entry }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = <HubCalendarEntryMark mark={toCalendarEntryMark(entry, groupId)} />;
  const actions = entry.viewerMayAnswer ? (
    <HubCalendarEntryAnswerChoice entry={entry} />
  ) : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toCalendarEntryMetaLine(entry, groupId);
  const description =
    entry.description === null ? null : (
      <KkText variant="body2" tone="secondary">
        {entry.description}
      </KkText>
    );

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
      {description}
    </KkFactRow>
  );
};
