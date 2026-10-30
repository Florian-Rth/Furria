import type { FC } from 'react';
import { toDoorLabel } from '../act-c-copy';
import type { DoorKey } from '../act-c-model';
import type { ActCView } from '../act-c-view';
import { ActCCastList } from './ActCCastList';
import { ActCEveningsList } from './ActCEveningsList';
import { ActCTrainingsList } from './ActCTrainingsList';

interface ActCDoorContentProps {
  view: ActCView;
  door: DoorKey;
}

export const ActCDoorContent: FC<ActCDoorContentProps> = ({ view, door }) => {
  switch (door) {
    case 'evening':
      return <ActCEveningsList view={view} />;
    case 'training':
      return <ActCTrainingsList view={view} />;
    case 'cast':
      return <ActCCastList view={view} label={toDoorLabel(door, view.template, view.kind)} />;
    case 'practice':
    case 'text':
      return null;
  }
};
