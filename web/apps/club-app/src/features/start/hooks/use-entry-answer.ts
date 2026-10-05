import type { KkAnswer } from '@furria/ui';
import { kkTokens } from '@furria/ui';
import type { Mutation } from '@tanstack/react-query';
import { useMutationState } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useState } from 'react';
import { startAnswerMutationKey, useStartAnswerMutation } from '../api';
import type { StartAnswerAttempt } from '../start-answer';
import { ANSWER_FAILURE_EFFECTS, latestAnswerErrorOf, toAnswerFailureOf } from '../start-answer';
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

const toAttempt = ({ state }: Mutation): StartAnswerAttempt => ({
  submittedAt: state.submittedAt,
  error: state.error,
});

export const useEntryAnswer = ({
  calendarEntryId,
  onTouch,
  onHeld,
}: EntryAnswerInput): EntryAnswer => {
  const mutation = useStartAnswerMutation(calendarEntryId);
  const [mountedAt] = useState(Date.now);
  const [holding, setHolding] = useState(false);
  const attempts = useMutationState({
    filters: { mutationKey: startAnswerMutationKey(calendarEntryId) },
    select: toAttempt,
  });
  const failure = toAnswerFailureOf(latestAnswerErrorOf(attempts, mountedAt));
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
