import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { KkCalendarLineGroup } from '@furria/ui/KkCalendarAgendaLine';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';

const PREVIEW_LABEL = 'Beispiel';
const OPEN_TITLE = 'Training';
const ANSWERED_TITLE = 'Gruppenabend';
const OPEN_VENUE = 'Turnhalle';
const ANSWERED_VENUE = 'Vereinsheim';
const FIRST = 0;
const SECOND = 1;

const SAMPLE_GROUPS: readonly KkCalendarLineGroup[] = [
  { key: 'sample', name: 'Tanzgarde', mark: 'club' },
];

const keep = (): void => {};

export const CalendarHelpAnswerPreview: FC = () => {
  const openTime = (
    <KkCalendarAgenda.Time main="19:00" sub="21:00" tone="ink" order={FIRST} accessibleLabel="" />
  );
  const answeredTime = (
    <KkCalendarAgenda.Time main="20:00" sub={null} tone="ink" order={SECOND} accessibleLabel="" />
  );
  const quick = (
    <KkCalendarAgenda.Quick
      label={OPEN_TITLE}
      labels={ATTENDANCE_LABELS}
      value={null}
      onChange={keep}
    />
  );
  const badge = (
    <KkCalendarAgenda.Badge
      answer="yes"
      label={ANSWERED_TITLE}
      order={SECOND}
      delayed={false}
      onSelect={keep}
    />
  );

  return (
    <KkCalendarAgenda label={PREVIEW_LABEL}>
      <KkCalendarAgenda.Panel>
        <KkCalendarAgenda.Line
          kind="training"
          title={OPEN_TITLE}
          venue={OPEN_VENUE}
          groups={SAMPLE_GROUPS}
          liveLabel={null}
          tone="club"
          quiet={false}
          selected={false}
          highlight={false}
          order={FIRST}
          accessibleLabel={OPEN_TITLE}
          time={openTime}
          aside={quick}
          onSelect={keep}
        />
        <KkCalendarAgenda.Line
          kind="plain"
          title={ANSWERED_TITLE}
          venue={ANSWERED_VENUE}
          groups={SAMPLE_GROUPS}
          liveLabel={null}
          tone="club"
          quiet={false}
          selected={false}
          highlight={false}
          order={SECOND}
          accessibleLabel={ANSWERED_TITLE}
          time={answeredTime}
          trailing={badge}
          onSelect={keep}
        />
      </KkCalendarAgenda.Panel>
    </KkCalendarAgenda>
  );
};
