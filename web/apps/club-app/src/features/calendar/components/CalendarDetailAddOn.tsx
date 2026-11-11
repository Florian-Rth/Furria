import type { KkCalendarLineGroup } from '@furria/ui/KkCalendarAgendaLine';
import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import type { FC, ReactNode } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarAddOnKind, CalendarEntry, CalendarEntryAddOn } from '../schemas';
import { CalendarDetailAttendance } from './CalendarDetailAttendance';
import { CalendarDetailDaySchedule } from './CalendarDetailDaySchedule';
import { CalendarDetailPoll } from './CalendarDetailPoll';
import { CalendarDetailSignUpList } from './CalendarDetailSignUpList';
import { CalendarGroupTags } from './CalendarGroupTags';

interface CalendarDetailAddOnProps {
  addOn: CalendarEntryAddOn;
  entry: CalendarEntry;
  participatingGroups: readonly KkCalendarLineGroup[];
  mayModerate: boolean;
}

export const CalendarDetailAddOn: FC<CalendarDetailAddOnProps> = ({
  addOn,
  entry,
  participatingGroups,
  mayModerate,
}) => {
  const attendance =
    addOn.kind === 'attendance' ? <CalendarDetailAttendance entry={entry} /> : null;
  const poll =
    addOn.kind === 'poll' ? (
      <CalendarDetailPoll poll={addOn.poll} entry={entry} mayClose={mayModerate} />
    ) : null;
  const signUpList =
    addOn.kind === 'signUpList' ? (
      <CalendarDetailSignUpList list={addOn.signUpList} entry={entry} mayModerate={mayModerate} />
    ) : null;
  const daySchedule =
    addOn.kind === 'daySchedule' ? (
      <CalendarDetailDaySchedule
        schedule={addOn.daySchedule}
        startsAt={entry.startsAt}
        endsAt={entry.endsAt}
      />
    ) : null;
  const contents: Record<CalendarAddOnKind, ReactNode> = {
    attendance,
    participatingGroups: <CalendarGroupTags groups={participatingGroups} />,
    poll,
    signUpList,
    daySchedule,
  };
  const content = contents[addOn.kind];

  return (
    <KkCalendarDetail.Section
      icon={CALENDAR_ADD_ON_ICONS[addOn.kind]}
      title={CALENDAR_ADD_ON_LABELS[addOn.kind]}
    >
      {content}
    </KkCalendarDetail.Section>
  );
};
