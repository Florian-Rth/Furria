import { KkScoreFacts } from '@furria/ui/KkScoreFacts';
import type { FC } from 'react';
import { useTrainingAnswer } from '@/features/act-card/hooks/use-training-answer';
import type { StudioTraining } from '@/features/acts/schemas';
import {
  ANSWER_LABEL,
  ANSWER_NO,
  ANSWER_YES,
  dayClockOf,
  TRAINING_FACT,
  TRAININGS_HINT,
} from '../score-copy';

interface ScoreTrainingFactProps {
  training: StudioTraining;
  saved: 'yes' | 'no' | null;
  inCast: boolean;
  onOpen: () => void;
}

export const ScoreTrainingFact: FC<ScoreTrainingFactProps> = ({
  training,
  saved,
  inCast,
  onOpen,
}) => {
  const answer = useTrainingAnswer(training.calendarEntryId, saved);
  const keys = inCast ? (
    <KkScoreFacts.Answer
      label={ANSWER_LABEL}
      value={answer.value}
      yesLabel={ANSWER_YES}
      noLabel={ANSWER_NO}
      busy={answer.busy}
      owed={answer.value === null}
      onAnswer={answer.answer}
    />
  ) : null;

  return (
    <KkScoreFacts.Fact
      icon="calendar"
      label={TRAINING_FACT}
      value={dayClockOf(training.startsAt)}
      trail={keys}
      openLabel={TRAININGS_HINT}
      onOpen={onOpen}
    />
  );
};
