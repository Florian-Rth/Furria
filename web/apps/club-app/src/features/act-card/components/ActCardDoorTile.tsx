import type { FC } from 'react';
import { toDoorLabel } from '../act-card-copy';
import type { DoorKey } from '../act-card-model';
import type { ActCardView } from '../act-card-view';
import { ActCardCastTile } from './ActCardCastTile';
import { ActCardEveningTile } from './ActCardEveningTile';
import { ActCardPracticeTile } from './ActCardPracticeTile';
import { ActCardTextTile } from './ActCardTextTile';
import { ActCardTrainingTile } from './ActCardTrainingTile';

interface ActCardDoorTileProps {
  view: ActCardView;
  door: DoorKey;
  order: number;
  current: boolean;
  onOpen: (door: DoorKey) => void;
}

export const ActCardDoorTile: FC<ActCardDoorTileProps> = ({
  view,
  door,
  order,
  current,
  onOpen,
}) => {
  const label = toDoorLabel(door, view.template, view.kind);

  const open = (): void => {
    onOpen(door);
  };

  switch (door) {
    case 'evening':
      return (
        <ActCardEveningTile
          view={view}
          label={label}
          order={order}
          current={current}
          onOpen={open}
        />
      );
    case 'training':
      return (
        <ActCardTrainingTile
          view={view}
          label={label}
          order={order}
          current={current}
          onOpen={open}
        />
      );
    case 'practice':
      return <ActCardPracticeTile view={view} label={label} order={order} />;
    case 'cast':
      return (
        <ActCardCastTile view={view} label={label} order={order} current={current} onOpen={open} />
      );
    case 'text':
      return <ActCardTextTile label={label} order={order} />;
  }
};
