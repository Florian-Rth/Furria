import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import { ATTENDANCE_CLOSED_LABEL, ATTENDANCE_ROLL_LABEL } from '@/lib/calendar-copy';
import type { AttendanceRoll } from '../calendar-attendance';
import { OPEN_TAB_ID } from '../calendar-names';
import { CalendarRollGroup } from './CalendarRollGroup';

interface CalendarAttendanceRollProps {
  roll: AttendanceRoll | null;
  onOpen: (tabId: string) => void;
}

export const CalendarAttendanceRoll: FC<CalendarAttendanceRollProps> = ({ roll, onOpen }) => {
  if (roll === null) {
    return null;
  }

  const meta = roll.isClosed ? <KkAnswerRoll.Meta text={ATTENDANCE_CLOSED_LABEL} /> : null;
  const groups = roll.tabs.map((tab) => (
    <CalendarRollGroup key={tab.id} tab={tab} showsNames={tab.id !== OPEN_TAB_ID} onOpen={onOpen} />
  ));

  return (
    <KkAnswerRoll label={ATTENDANCE_ROLL_LABEL}>
      {meta}
      {groups}
    </KkAnswerRoll>
  );
};
