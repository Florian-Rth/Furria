import type { FC } from 'react';
import { toDoorLabel } from '../act-card-copy';
import type { DoorKey } from '../act-card-model';
import type { ActCardView } from '../act-card-view';
import { ActCardCastList } from './ActCardCastList';
import { ActCardEveningsList } from './ActCardEveningsList';
import { ActCardTrainingsList } from './ActCardTrainingsList';

interface ActCardDoorContentProps {
  view: ActCardView;
  door: DoorKey;
}

export const ActCardDoorContent: FC<ActCardDoorContentProps> = ({ view, door }) => {
  switch (door) {
    case 'evening':
      return <ActCardEveningsList view={view} />;
    case 'training':
      return <ActCardTrainingsList view={view} />;
    case 'cast':
      return <ActCardCastList view={view} label={toDoorLabel(door, view.template, view.kind)} />;
    case 'practice':
    case 'text':
      return null;
  }
};
