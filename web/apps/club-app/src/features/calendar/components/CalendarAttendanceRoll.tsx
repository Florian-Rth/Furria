import type { KkAnswerRollTone } from '@furria/ui/KkAnswerRoll';
import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import type { AttendanceRollKey } from '../calendar-attendance';
import { toAttendanceRoll, toRollNames } from '../calendar-attendance';
import type { CalendarAttendance } from '../schemas';

const ROLL_LABEL = 'Antworten';
const CLOSED_LABEL = 'Geschlossen';
const GROUP_LABELS: Record<AttendanceRollKey, string> = {
  yes: 'Zusage',
  maybe: 'Vielleicht',
  no: 'Absage',
  open: 'Noch offen',
};

const toOnBehalfLabel = (recordedBy: string): string => `(durch ${recordedBy})`;

interface CalendarAttendanceRollProps {
  attendance: CalendarAttendance;
}

export const CalendarAttendanceRoll: FC<CalendarAttendanceRollProps> = ({ attendance }) => {
  const roll = toAttendanceRoll(attendance);
  const meta = roll.isClosed ? <KkAnswerRoll.Meta text={CLOSED_LABEL} /> : null;
  const groups = roll.groups.map((group) => {
    const tone: KkAnswerRollTone = group.key;
    const names = toRollNames(group.people, toOnBehalfLabel);

    return (
      <KkAnswerRoll.Group
        key={group.key}
        tone={tone}
        label={GROUP_LABELS[group.key]}
        count={group.count}
        names={names}
      />
    );
  });

  return (
    <KkAnswerRoll label={ROLL_LABEL}>
      {meta}
      {groups}
    </KkAnswerRoll>
  );
};
