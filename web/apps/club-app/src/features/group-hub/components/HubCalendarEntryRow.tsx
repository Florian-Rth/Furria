import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkOpenMarks } from '@furria/ui/KkOpenMarks';
import { KkText } from '@furria/ui/KkText';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AttendanceChoice } from '@/features/attendance/components/AttendanceChoice';
import { toOpenMarks } from '@/features/calendar/calendar-open-marks';
import { canAnswer } from '@/lib/calendar-answering';
import { toDayNumberLabel, toLocalIsoDay, toWeekdayEyebrow } from '@/lib/calendar-days';
import { toCalendarEntryMark, toCalendarEntryMetaLine } from '../group-calendar-entries';
import type { GroupCalendarEntry } from '../schemas';
import { HubCalendarEntryMark } from './HubCalendarEntryMark';

const CALENDAR_ROUTE = '/calendar';

interface HubCalendarEntryRowProps {
  groupId: number;
  entry: GroupCalendarEntry;
}

export const HubCalendarEntryRow: FC<HubCalendarEntryRowProps> = ({ groupId, entry }) => {
  const tone = entry.isRunning ? 'accent' : 'neutral';
  const chip = <HubCalendarEntryMark mark={toCalendarEntryMark(entry, groupId)} />;
  const answerable = canAnswer(entry);
  const actions = answerable ? <AttendanceChoice entry={entry} /> : undefined;
  const span = toDayNumberLabel(entry.startsAt);
  const spanLabel = toWeekdayEyebrow(entry.startsAt);
  const meta = toCalendarEntryMetaLine(entry, groupId);
  const search = { day: toLocalIsoDay(entry.startsAt), entry: entry.calendarEntryId };
  const openMarks = toOpenMarks(entry);
  const marks = openMarks.length === 0 ? undefined : <KkOpenMarks marks={openMarks} />;
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
      marks={marks}
      tone={tone}
      chip={chip}
      actions={actions}
      component={Link}
      to={CALENDAR_ROUTE}
      search={search}
    >
      {description}
    </KkFactRow>
  );
};
