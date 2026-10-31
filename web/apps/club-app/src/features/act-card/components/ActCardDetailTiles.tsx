import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import type { FC } from 'react';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import { DETAILS_TITLE } from '../act-card-copy';
import type { ActCardView } from '../act-card-view';
import { detailTilesOf } from '../detail-tiles';
import { ActCardStatTile } from './ActCardStatTile';

interface ActCardDetailTilesProps {
  view: ActCardView;
}

export const ActCardDetailTiles: FC<ActCardDetailTilesProps> = ({ view }) => {
  const plans = usePlansRunningOrder();
  const cells = detailTilesOf(view, plans).map((tile, order) => (
    <KkFacetGrid.Cell key={tile.key} reach="tile">
      <ActCardStatTile tile={tile} order={order} />
    </KkFacetGrid.Cell>
  ));

  if (cells.length === 0) {
    return null;
  }

  return <KkFacetGrid label={DETAILS_TITLE}>{cells}</KkFacetGrid>;
};
