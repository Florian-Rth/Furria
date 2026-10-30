import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import {
  ANSWER_NO,
  ANSWER_YES,
  toDateFigure,
  toDoorHint,
  toMoreTrainings,
  toTallyLine,
  toTallyMeta,
  toWeekdayClock,
} from '../act-c-copy';
import { isOwed } from '../act-c-model';
import type { ActCView, NextTraining } from '../act-c-view';
import { useTrainingAnswer } from '../hooks/use-training-answer';

const OWED_LINE = 'Antwort fehlt';
const KEYS_LABEL = 'Deine Antwort zum Training';

interface ActCTrainingAnswerTileProps {
  view: ActCView;
  training: NextTraining;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCTrainingAnswerTile: FC<ActCTrainingAnswerTileProps> = ({
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
  const state = owed ? <KkFacetTile.Line tone="attention">{OWED_LINE}</KkFacetTile.Line> : null;
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
      <KkFacetTile.Door
        icon="calendar"
        label={label}
        hint={toDoorHint('training')}
        onOpen={onOpen}
      />
      <KkFacetTile.Figure
        value={toDateFigure(training.startsAt)}
        aside={toWeekdayClock(training.startsAt)}
      />
      <KkFacetTile.Stack>
        {state}
        {tallyLine}
        {moreLine}
      </KkFacetTile.Stack>
      <KkFacetTile.Foot>{keys}</KkFacetTile.Foot>
    </KkFacetTile>
  );
};
