import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { StartEntry } from '../schemas';
import { useEntryAnswer } from './use-entry-answer';
import type { StartBoard } from './use-start-view';

export interface OwedAttendanceView {
  choiceLabel: string;
  value: KkAnswer | null;
  choose: (answer: KkAnswer) => void;
  error: string | undefined;
  disabled: boolean;
}

const settled = (): void => undefined;

export const useOwedAttendance = (entry: StartEntry, board: StartBoard): OwedAttendanceView => {
  const answer = useEntryAnswer({
    calendarEntryId: entry.calendarEntryId,
    onTouch: board.touch,
    onHeld: settled,
  });

  return {
    choiceLabel: toAttendanceChoiceLabel(entry.title),
    value: entry.attendance?.viewerAnswer ?? null,
    choose: answer.choose,
    error: answer.failure,
    disabled: answer.dims,
  };
};
