import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import type { FC } from 'react';
import type { DoorKey } from '../act-card-model';
import { doorReachOf } from '../act-card-model';
import type { ActCardView } from '../act-card-view';
import { ActCardDoorTile } from './ActCardDoorTile';

interface ActCardTilesProps {
  view: ActCardView;
  current: DoorKey | null;
  fill: boolean;
  onOpen: (door: DoorKey) => void;
}

export const ActCardTiles: FC<ActCardTilesProps> = ({ view, current, fill, onOpen }) => {
  const reach = doorReachOf(view.doors);
  const cells = view.doors.map((door, order) => {
    return (
      <KkFacetGrid.Cell key={door} reach={reach}>
        <ActCardDoorTile
          view={view}
          door={door}
          order={order}
          current={door === current}
          onOpen={onOpen}
        />
      </KkFacetGrid.Cell>
    );
  });

  return <KkFacetGrid fill={fill}>{cells}</KkFacetGrid>;
};
