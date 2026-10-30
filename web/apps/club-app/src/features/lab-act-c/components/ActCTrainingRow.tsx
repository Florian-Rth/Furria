import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkFacetTile } from '@furria/ui/KkFacetTile';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { StudioTraining } from '@/features/acts/schemas';
import {
  ANSWER_NO,
  ANSWER_YES,
  toDateFigure,
  toDayLine,
  toTallyMeta,
  toWeekdayClock,
} from '../act-c-copy';
import { answerKeyOf, isOwed, trainingTallyOf, viewerAnswerOf } from '../act-c-model';
import { useTrainingAnswer } from '../hooks/use-training-answer';
import { calendarEntryLinkOf } from '../lab-act-c-paths';

const KEYS_LABEL = 'Deine Antwort';

interface ActCTrainingRowProps {
  training: StudioTraining;
  viewerId: number | null;
  inCast: boolean;
  castSize: number;
  current: boolean;
}

export const ActCTrainingRow: FC<ActCTrainingRowProps> = ({
  training,
  viewerId,
  inCast,
  castSize,
  current,
}) => {
  const saved = answerKeyOf(viewerAnswerOf(training, viewerId));
  const answer = useTrainingAnswer(training.calendarEntryId, saved);
  const owed = isOwed(inCast, answer.value);
  const link = calendarEntryLinkOf(training.calendarEntryId);
  const keysLabel = `${KEYS_LABEL} ${toDayLine(training.startsAt)}`;
  const lead = toDateFigure(training.startsAt);
  const title = toWeekdayClock(training.startsAt);
  const tally = toTallyMeta(trainingTallyOf(training, castSize));
  const keys = inCast ? (
    <KkFacetTile.Keys
      label={keysLabel}
      value={answer.value}
      yesLabel={ANSWER_YES}
      noLabel={ANSWER_NO}
      busy={answer.busy}
      fit="content"
      onAnswer={answer.answer}
    />
  ) : null;

  return (
    <KkFacetList.Row
      lead={lead}
      leadTone={owed ? 'attention' : 'ink'}
      title={title}
      meta={tally}
      current={current}
      trailing={keys}
      component={Link}
      to={link.to}
      params={link.params}
    />
  );
};
