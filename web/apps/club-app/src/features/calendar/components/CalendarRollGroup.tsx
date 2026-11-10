import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import { ATTENDANCE_ROLL_LABELS, toOnBehalfLabel } from '@/lib/calendar-copy';
import type { AttendanceRollGroup } from '../calendar-attendance';
import { toRollNames } from '../calendar-attendance';

interface CalendarRollGroupProps {
  group: AttendanceRollGroup;
}

export const CalendarRollGroup: FC<CalendarRollGroupProps> = ({ group }) => {
  const names = toRollNames(group.people, toOnBehalfLabel);

  return (
    <KkAnswerRoll.Group
      tone={group.key}
      label={ATTENDANCE_ROLL_LABELS[group.key]}
      count={group.count}
      names={names}
    />
  );
};
