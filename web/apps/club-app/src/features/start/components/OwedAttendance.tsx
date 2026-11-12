import type { FC } from 'react';
import { useOwedAttendance } from '../hooks/use-owed-attendance';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';
import { OwedAttendanceChoice } from './OwedAttendanceChoice';

interface OwedAttendanceProps {
  entry: StartEntry;
  board: StartBoard;
}

export const OwedAttendance: FC<OwedAttendanceProps> = ({ entry, board }) => {
  const answer = useOwedAttendance(entry, board);

  return <OwedAttendanceChoice view={answer} />;
};
