import type { FC } from 'react';
import { useOwedAnnouncementAttendance } from '../hooks/use-owed-announcement-attendance';
import type { StartBoard } from '../hooks/use-start-view';
import type { AnnouncementOwedHost } from '../owed-items';
import { OwedAttendanceChoice } from './OwedAttendanceChoice';

interface OwedAnnouncementAttendanceProps {
  host: AnnouncementOwedHost;
  board: StartBoard;
}

export const OwedAnnouncementAttendance: FC<OwedAnnouncementAttendanceProps> = ({
  host,
  board,
}) => {
  const answer = useOwedAnnouncementAttendance(host, board);

  return <OwedAttendanceChoice view={answer} />;
};
