import { KkFactRow, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { toTermineMark, toTerminMetaLine } from '../group-termine';
import type { GroupCalendarEntry } from '../schemas';
import { HubTermineAnswers } from './HubTermineAnswers';
import { HubTermineMark } from './HubTermineMark';

interface HubTermineRowProps {
  groupId: number;
  entry: GroupCalendarEntry;
}

export const HubTermineRow: FC<HubTermineRowProps> = ({ groupId, entry }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = <HubTermineMark mark={toTermineMark(entry, groupId)} />;
  const actions = entry.asksForResponse ? (
    <HubTermineAnswers groupId={groupId} entry={entry} />
  ) : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toTerminMetaLine(entry, groupId);

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
