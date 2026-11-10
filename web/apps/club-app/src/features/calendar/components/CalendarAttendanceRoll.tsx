import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import {
  ATTENDANCE_CLOSED_LABEL,
  ATTENDANCE_ROLL_LABEL,
  ATTENDANCE_ROLL_LABELS,
  toOnBehalfLabel,
} from '@/lib/calendar-copy';
import type { AttendanceRoll } from '../calendar-attendance';
import { toRollNames } from '../calendar-attendance';

interface CalendarAttendanceRollProps {
  roll: AttendanceRoll;
}

export const CalendarAttendanceRoll: FC<CalendarAttendanceRollProps> = ({ roll }) => {
  const meta = roll.isClosed ? <KkAnswerRoll.Meta text={ATTENDANCE_CLOSED_LABEL} /> : null;
  const groups = roll.groups.map((group) => {
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

  return (
    <KkAnswerRoll label={ATTENDANCE_ROLL_LABEL}>
      {meta}
      {groups}
    </KkAnswerRoll>
  );
};
