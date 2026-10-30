import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import type { FC } from 'react';
import type { DoorKey } from '../act-c-model';
import { doorReachOf } from '../act-c-model';
import type { ActCView } from '../act-c-view';
import { ActCDoorTile } from './ActCDoorTile';

interface ActCTilesProps {
  view: ActCView;
  current: DoorKey | null;
  onOpen: (door: DoorKey) => void;
}

export const ActCTiles: FC<ActCTilesProps> = ({ view, current, onOpen }) => {
  const reach = doorReachOf(view.template);
  const cells = view.doors.map((door, order) => {
    return (
      <KkFacetGrid.Cell key={door} reach={reach}>
        <ActCDoorTile
          view={view}
          door={door}
          order={order}
          current={door === current}
          onOpen={onOpen}
        />
      </KkFacetGrid.Cell>
    );
  });

  return <KkFacetGrid>{cells}</KkFacetGrid>;
};
