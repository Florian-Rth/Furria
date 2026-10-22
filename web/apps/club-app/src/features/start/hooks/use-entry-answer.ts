import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import { kkTokens } from '@furria/ui/tokens';
import { useEffect, useEffectEvent, useState } from 'react';
import { ATTENDANCE_FAILURE_EFFECTS } from '@/features/attendance/attendance-answer';
import { useAttendanceAnswer } from '@/features/attendance/hooks/use-attendance-answer';
import { itemKeyOf } from '../start-visit';

export interface EntryAnswerInput {
  calendarEntryId: number;
  onTouch: (key: string) => void;
  onHeld: () => void;
}

export interface EntryAnswer {
  choose: (answer: KkAnswer) => void;
  holding: boolean;
  failure: string | undefined;
  dims: boolean;
}

const { holdMs } = kkTokens.motion.greeting;

export const useEntryAnswer = ({
  calendarEntryId,
  onTouch,
  onHeld,
}: EntryAnswerInput): EntryAnswer => {
  const answer = useAttendanceAnswer(calendarEntryId);
  const [holding, setHolding] = useState(false);
  const effect = answer.failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[answer.failure];

  const release = useEffectEvent((): void => {
    setHolding(false);
    onHeld();
  });

  useEffect(() => {
    if (!holding) {
      return;
    }

    const timer = setTimeout(release, holdMs);

    return () => {
      clearTimeout(timer);
    };
  }, [holding]);

  const choose = (chosen: KkAnswer): void => {
    onTouch(itemKeyOf({ panel: 'calendar', calendarEntryId }));
    answer.choose(chosen);
    setHolding(true);
  };

  return {
    choose,
    holding,
    failure: effect?.message ?? undefined,
    dims: effect?.dims ?? false,
  };
};
