import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import { NO_TRAINING, NONE } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { ActCTrainingAnswerTile } from './ActCTrainingAnswerTile';

interface ActCTrainingTileProps {
  view: ActCView;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCTrainingTile: FC<ActCTrainingTileProps> = ({
  view,
  label,
  order,
  current,
  onOpen,
}) => {
  const training = view.nextTraining;

  if (training === null) {
    return (
      <KkFacetTile label={label} order={order} current={current}>
        <KkFacetTile.Door icon="calendar" label={label} />
        <KkFacetTile.Line tone="strong">{NO_TRAINING}</KkFacetTile.Line>
        <KkFacetTile.Line>{NONE}</KkFacetTile.Line>
      </KkFacetTile>
    );
  }

  return (
    <ActCTrainingAnswerTile
      key={training.calendarEntryId}
      view={view}
      training={training}
      label={label}
      order={order}
      current={current}
      onOpen={onOpen}
    />
  );
};
