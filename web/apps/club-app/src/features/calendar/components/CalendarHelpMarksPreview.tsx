import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { KkOpenMark } from '@furria/ui/KkOpenMarks';
import { KkOpenMarks } from '@furria/ui/KkOpenMarks';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_ICONS } from '../calendar-add-ons';
import { OPEN_MARK_LABELS } from '../calendar-agenda-copy';

const PREVIEW_LABEL = 'Beispiel';
const SAMPLE_TITLE = 'Sessionseröffnung';
const SAMPLE_VENUE = 'Bürgerhaus';
const FIRST = 0;

const SAMPLE_MARKS: readonly KkOpenMark[] = [
  { key: 'vote', icon: CALENDAR_ADD_ON_ICONS.poll, label: OPEN_MARK_LABELS.vote },
  { key: 'signUpList', icon: CALENDAR_ADD_ON_ICONS.signUpList, label: OPEN_MARK_LABELS.signUpList },
];

const keep = (): void => {};

export const CalendarHelpMarksPreview: FC = () => {
  const time = (
    <KkCalendarAgenda.Time main="11:11" sub={null} tone="ink" order={FIRST} accessibleLabel="" />
  );

  return (
    <KkCalendarAgenda label={PREVIEW_LABEL}>
      <KkCalendarAgenda.Panel>
        <KkCalendarAgenda.Line
          kind="event"
          title={SAMPLE_TITLE}
          venue={SAMPLE_VENUE}
          groups={[]}
          liveLabel={null}
          tone="club"
          quiet={false}
          selected={false}
          highlight={false}
          order={FIRST}
          accessibleLabel={SAMPLE_TITLE}
          time={time}
          marks={<KkOpenMarks marks={SAMPLE_MARKS} />}
          onSelect={keep}
        />
      </KkCalendarAgenda.Panel>
    </KkCalendarAgenda>
  );
};
