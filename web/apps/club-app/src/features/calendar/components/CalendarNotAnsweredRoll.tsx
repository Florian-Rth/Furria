import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import { toOpenGroup } from '../calendar-attendance';
import type { CalendarAttendancePerson } from '../schemas';
import { CalendarRollGroup } from './CalendarRollGroup';

interface CalendarNotAnsweredRollProps {
  label: string;
  notAnswered: readonly CalendarAttendancePerson[] | null;
}

export const CalendarNotAnsweredRoll: FC<CalendarNotAnsweredRollProps> = ({
  label,
  notAnswered,
}) => {
  const groups = toOpenGroup(notAnswered);

  if (groups.length === 0) {
    return null;
  }

  const rows = groups.map((group) => <CalendarRollGroup key={group.key} group={group} />);

  return <KkAnswerRoll label={label}>{rows}</KkAnswerRoll>;
};
