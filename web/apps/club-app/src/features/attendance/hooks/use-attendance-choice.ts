import { useKkNotice } from '@furria/ui/KkNotice';
import { toAttendanceSavedMessage } from '@/lib/calendar-copy';
import { ATTENDANCE_FAILURE_EFFECTS } from '../attendance-answer';
import type { AttendanceAnswer } from '../schemas';
import { useAttendanceAnswer } from './use-attendance-answer';
import { usePendingAnswers } from './use-pending-answers';

export interface AnswerableEntry {
  calendarEntryId: number;
  viewerAnswer: AttendanceAnswer | null;
}

export interface AttendanceChoice {
  answer: AttendanceAnswer | null;
  failureMessage: string | undefined;
  isInert: boolean;
  choose: (answer: AttendanceAnswer) => void;
}

export const useAttendanceChoice = (entry: AnswerableEntry): AttendanceChoice => {
  const raiseNotice = useKkNotice();
  const pendingAnswers = usePendingAnswers();
  const { choose, failure } = useAttendanceAnswer(entry.calendarEntryId, {
    onSaved: (answer) => {
      raiseNotice({ tone: 'success', message: toAttendanceSavedMessage(answer) });
    },
  });
  const effect = failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[failure];

  return {
    answer: pendingAnswers.get(entry.calendarEntryId) ?? entry.viewerAnswer,
    failureMessage: effect?.message ?? undefined,
    isInert: effect?.dims ?? false,
    choose,
  };
};
