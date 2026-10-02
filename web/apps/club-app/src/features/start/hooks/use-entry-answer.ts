import type { KkAnswer } from '@furria/ui';
import { kkTokens } from '@furria/ui';
import { useEffect, useEffectEvent, useState } from 'react';
import { useStartAnswerMutation } from '../api';
import { ANSWER_FAILURE_EFFECTS, toAnswerFailureOf } from '../start-answer';
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
  const mutation = useStartAnswerMutation(calendarEntryId);
  const [holding, setHolding] = useState(false);
  const failure = toAnswerFailureOf(mutation.error);
  const effect = failure === null ? null : ANSWER_FAILURE_EFFECTS[failure];

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

  const choose = (answer: KkAnswer): void => {
    onTouch(itemKeyOf({ panel: 'calendar', calendarEntryId }));
    mutation.mutate(answer);
    setHolding(true);
  };

  return {
    choose,
    holding,
    failure: effect?.message ?? undefined,
    dims: effect?.dims ?? false,
  };
};
