import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import {
  ANSWER_NO,
  ANSWER_YES,
  toAnswerLine,
  toDateFigure,
  toDoorHint,
  toMoreTrainings,
  toTallyLine,
  toTallyMeta,
  toWeekdayClock,
} from '../act-card-copy';
import { isOwed } from '../act-card-model';
import type { ActCardView, NextTraining } from '../act-card-view';
import { useTrainingAnswer } from '../hooks/use-training-answer';

const KEYS_LABEL = 'Deine Antwort zum Training';

interface ActCardTrainingAnswerTileProps {
  view: ActCardView;
  training: NextTraining;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCardTrainingAnswerTile: FC<ActCardTrainingAnswerTileProps> = ({
  view,
  training,
  label,
  order,
  current,
  onOpen,
}) => {
  const answer = useTrainingAnswer(training.calendarEntryId, training.answer);
  const owed = isOwed(view.inCast, answer.value);
  const tally = view.inCast ? toTallyLine(training.tally) : toTallyMeta(training.tally);
  const stateText = answer.failure ?? toAnswerLine(owed, null);
  const state =
    stateText === '' ? null : <KkFacetTile.Line tone="attention">{stateText}</KkFacetTile.Line>;
  const hint = toDoorHint('training');
  const figure = toDateFigure(training.startsAt);
  const aside = toWeekdayClock(training.startsAt);
  const more = toMoreTrainings(view.trainings.length - 1);
  const tallyLine = tally === null ? null : <KkFacetTile.Line>{tally}</KkFacetTile.Line>;
  const moreLine =
    view.inCast || more === null ? null : <KkFacetTile.Line>{more}</KkFacetTile.Line>;
  const keys = view.inCast ? (
    <KkFacetTile.Keys
      label={KEYS_LABEL}
      value={answer.value}
      yesLabel={ANSWER_YES}
      noLabel={ANSWER_NO}
      busy={answer.busy}
      onAnswer={answer.answer}
    />
  ) : null;

  return (
    <KkFacetTile label={label} order={order} attention={owed} current={current}>
      <KkFacetTile.Door icon="calendar" label={label} hint={hint} onOpen={onOpen} />
      <KkFacetTile.Figure value={figure} aside={aside} />
      <KkFacetTile.Stack>
        {state}
        {tallyLine}
        {moreLine}
      </KkFacetTile.Stack>
      <KkFacetTile.Foot>{keys}</KkFacetTile.Foot>
    </KkFacetTile>
  );
};
