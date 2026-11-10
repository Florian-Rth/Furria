import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import { ATTENDANCE_CLOSED_LABEL, ATTENDANCE_ROLL_LABEL } from '@/lib/calendar-copy';
import type { AttendanceRoll } from '../calendar-attendance';
import { CalendarRollGroup } from './CalendarRollGroup';

interface CalendarAttendanceRollProps {
  roll: AttendanceRoll | null;
}

export const CalendarAttendanceRoll: FC<CalendarAttendanceRollProps> = ({ roll }) => {
  if (roll === null) {
    return null;
  }

  const meta = roll.isClosed ? <KkAnswerRoll.Meta text={ATTENDANCE_CLOSED_LABEL} /> : null;
  const groups = roll.groups.map((group) => <CalendarRollGroup key={group.key} group={group} />);

  return (
    <KkAnswerRoll label={ATTENDANCE_ROLL_LABEL}>
      {meta}
      {groups}
    </KkAnswerRoll>
  );
};
