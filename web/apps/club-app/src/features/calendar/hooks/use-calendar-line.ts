import { useState } from 'react';
import { useAttendanceChoice } from '@/features/attendance/hooks/use-attendance-choice';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { asksForAnswer, isOver } from '../calendar-agenda';
import type { CalendarEntry } from '../schemas';

export type CalendarLineAnswerState = 'none' | 'choice' | 'badge';

export interface CalendarLineAnswer {
  state: CalendarLineAnswerState;
  answer: AttendanceAnswer | null;
  arrivedAnswered: boolean;
  error: string | undefined;
  inert: boolean;
  choose: (answer: AttendanceAnswer) => void;
  reopen: () => void;
}

const stateOf = (
  entry: CalendarEntry,
  answer: AttendanceAnswer | null,
  reopened: boolean,
  nowMs: number,
  primary: boolean,
): CalendarLineAnswerState => {
  if (!asksForAnswer(entry) || !primary) {
    return 'none';
  }
  if (answer === null) {
    return isOver(entry, nowMs) ? 'none' : 'choice';
  }

  return reopened ? 'choice' : 'badge';
};

export const useCalendarLine = (
  entry: CalendarEntry,
  nowMs: number,
  primary: boolean,
): CalendarLineAnswer => {
  const choice = useAttendanceChoice(entry);
  const [reopened, setReopened] = useState(false);
  const [arrivedAnswered] = useState(choice.answer !== null);

  return {
    state: stateOf(entry, choice.answer, reopened, nowMs, primary),
    answer: choice.answer,
    arrivedAnswered,
    error: choice.failureMessage,
    inert: choice.isInert,
    choose: (answer) => {
      setReopened(false);
      choice.choose(answer);
    },
    reopen: () => {
      setReopened(true);
    },
  };
};
