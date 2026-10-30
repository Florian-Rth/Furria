import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PassTraining } from '../pass-act';
import {
  NEXT_TRAINING_EYEBROW,
  NO_TRAINING_LABEL,
  NO_TRAINING_VALUE,
  toDayAndClock,
  toTally,
  toTrainingTitle,
} from '../pass-copy';
import { trainingLinkOf } from '../pass-paths';
import { PassTrainingAnswer } from './PassTrainingAnswer';

interface PassCardTrainingProps {
  training: PassTraining;
  actName: string;
}

export const PassCardTraining: FC<PassCardTrainingProps> = ({ training, actName }) => {
  if (training.kind === 'none') {
    return <KkPassCard.Fact label={NO_TRAINING_LABEL} value={NO_TRAINING_VALUE} />;
  }

  const title = toTrainingTitle(training);

  if (training.kind === 'answer') {
    return (
      <PassTrainingAnswer
        key={training.calendarEntryId}
        calendarEntryId={training.calendarEntryId}
        startsAt={training.startsAt}
        title={title}
        saved={training.answer}
        actName={actName}
      />
    );
  }

  const link = trainingLinkOf(training.calendarEntryId);

  return (
    <KkPassCard.Training
      eyebrow={NEXT_TRAINING_EYEBROW}
      when={toDayAndClock(training.startsAt)}
      title={title}
      tally={toTally(training.present, training.absent)}
      component={Link}
      to={link.to}
      search={link.search}
    />
  );
};
