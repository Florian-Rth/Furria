import type { KkCalendarLineGroup } from '@furria/ui/KkCalendarAgendaLine';
import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import type { FC, ReactNode } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { AttendanceRoll } from '../calendar-attendance';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';
import type { CalendarAddOnKind, CalendarEntryAddOn } from '../schemas';
import { CalendarDetailAttendance } from './CalendarDetailAttendance';
import { CalendarDetailDaySchedule } from './CalendarDetailDaySchedule';
import { CalendarDetailPoll } from './CalendarDetailPoll';
import { CalendarDetailSignUpList } from './CalendarDetailSignUpList';
import { CalendarGroupTags } from './CalendarGroupTags';

interface CalendarDetailAddOnProps {
  addOn: CalendarEntryAddOn;
  answer: CalendarDetailAnswer | null;
  roll: AttendanceRoll | null;
  participatingGroups: readonly KkCalendarLineGroup[];
  mayModerate: boolean;
  mayAnswer: boolean;
  startsAt: string;
  endsAt: string | null;
}

export const CalendarDetailAddOn: FC<CalendarDetailAddOnProps> = ({
  addOn,
  answer,
  roll,
  participatingGroups,
  mayModerate,
  mayAnswer,
  startsAt,
  endsAt,
}) => {
  const attendance =
    addOn.kind === 'attendance' ? <CalendarDetailAttendance answer={answer} roll={roll} /> : null;
  const poll =
    addOn.kind === 'poll' ? (
      <CalendarDetailPoll poll={addOn.poll} mayClose={mayModerate} mayAnswer={mayAnswer} />
    ) : null;
  const signUpList =
    addOn.kind === 'signUpList' ? (
      <CalendarDetailSignUpList
        list={addOn.signUpList}
        mayModerate={mayModerate}
        mayAnswer={mayAnswer}
      />
    ) : null;
  const daySchedule =
    addOn.kind === 'daySchedule' ? (
      <CalendarDetailDaySchedule schedule={addOn.daySchedule} startsAt={startsAt} endsAt={endsAt} />
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
