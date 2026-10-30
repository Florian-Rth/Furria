import type { FC } from 'react';
import { toDoorLabel } from '../act-c-copy';
import type { DoorKey } from '../act-c-model';
import type { ActCView } from '../act-c-view';
import { ActCCastTile } from './ActCCastTile';
import { ActCEveningTile } from './ActCEveningTile';
import { ActCPracticeTile } from './ActCPracticeTile';
import { ActCTextTile } from './ActCTextTile';
import { ActCTrainingTile } from './ActCTrainingTile';

interface ActCDoorTileProps {
  view: ActCView;
  door: DoorKey;
  order: number;
  current: boolean;
  onOpen: (door: DoorKey) => void;
}

export const ActCDoorTile: FC<ActCDoorTileProps> = ({ view, door, order, current, onOpen }) => {
  const label = toDoorLabel(door, view.template, view.kind);

  const open = (): void => {
    onOpen(door);
  };

  switch (door) {
    case 'evening':
      return (
        <ActCEveningTile view={view} label={label} order={order} current={current} onOpen={open} />
      );
    case 'training':
      return (
        <ActCTrainingTile view={view} label={label} order={order} current={current} onOpen={open} />
      );
    case 'practice':
      return <ActCPracticeTile view={view} label={label} order={order} />;
    case 'cast':
      return (
        <ActCCastTile view={view} label={label} order={order} current={current} onOpen={open} />
      );
    case 'text':
      return <ActCTextTile label={label} order={order} />;
  }
};
