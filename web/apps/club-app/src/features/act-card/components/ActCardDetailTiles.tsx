import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import type { FC } from 'react';
import { DETAILS_TITLE } from '../act-card-copy';
import type { ActCardView } from '../act-card-view';
import { detailTilesOf } from '../detail-tiles';
import { ActCardStatTile } from './ActCardStatTile';

interface ActCardDetailTilesProps {
  view: ActCardView;
}

export const ActCardDetailTiles: FC<ActCardDetailTilesProps> = ({ view }) => {
  const cells = detailTilesOf(view).map((tile, order) => (
    <KkFacetGrid.Cell key={tile.key} reach="tile">
      <ActCardStatTile tile={tile} order={order} />
    </KkFacetGrid.Cell>
  ));

  return <KkFacetGrid label={DETAILS_TITLE}>{cells}</KkFacetGrid>;
};
