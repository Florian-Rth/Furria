import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import { ATTENDANCE_ROLL_LABELS, toOnBehalfLabel } from '@/lib/calendar-copy';
import { toOpenGroup, toRollNames } from '../calendar-attendance';
import type { CalendarAttendancePerson } from '../schemas';

const NOT_ANSWERED_LABEL = 'Noch offen';

interface CalendarNotAnsweredRollProps {
  notAnswered: readonly CalendarAttendancePerson[];
}

export const CalendarNotAnsweredRoll: FC<CalendarNotAnsweredRollProps> = ({ notAnswered }) => {
  const groups = toOpenGroup(notAnswered).map((group) => {
    const names = toRollNames(group.people, toOnBehalfLabel);

    return (
      <KkAnswerRoll.Group
        key={group.key}
        tone={group.key}
        label={ATTENDANCE_ROLL_LABELS[group.key]}
        count={group.count}
        names={names}
      />
    );
  });

  return <KkAnswerRoll label={NOT_ANSWERED_LABEL}>{groups}</KkAnswerRoll>;
};
