import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import { useAnnouncementAnswerMutation } from '@/features/announcements/api';
import { toAttendanceDims } from '@/features/attendance/attendance-answer';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { AnnouncementOwedHost } from '../owed-items';
import { toHostItemKey } from '../owed-items';
import type { OwedAttendanceView } from './use-owed-attendance';
import type { StartBoard } from './use-start-view';

export const useOwedAnnouncementAttendance = (
  host: AnnouncementOwedHost,
  board: StartBoard,
): OwedAttendanceView => {
  const { announcement } = host;
  const answering = useAnnouncementAnswerMutation(announcement.announcementId);
  const sent = answering.isError ? undefined : answering.variables;

  return {
    choiceLabel: toAttendanceChoiceLabel(announcement.title),
    value: sent ?? announcement.attendance?.viewerAnswer ?? null,
    choose: (answer: KkAnswer) => {
      board.touch(toHostItemKey(host));
      answering.mutate(answer);
    },
    error: undefined,
    disabled: answering.isPending || toAttendanceDims(answering.error),
  };
};
