import { KkFacetFold } from '@furria/ui/KkFacetFold';
import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import type { FC } from 'react';
import { DETAILS_TITLE } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { detailTilesOf, toDetailsSummary } from '../detail-tiles';
import { useDetailsFold } from '../hooks/use-details-fold';
import { ActCStatTile } from './ActCStatTile';

interface ActCDetailsProps {
  view: ActCView;
}

export const ActCDetails: FC<ActCDetailsProps> = ({ view }) => {
  const fold = useDetailsFold();
  const tiles = detailTilesOf(view);
  const summary = toDetailsSummary(tiles);
  const cells = tiles.map((tile, order) => (
    <KkFacetGrid.Cell key={tile.key} reach="tile">
      <ActCStatTile tile={tile} order={order} />
    </KkFacetGrid.Cell>
  ));

  return (
    <KkFacetFold title={DETAILS_TITLE} summary={summary} open={fold.open} onToggle={fold.toggle}>
      <KkFacetGrid>{cells}</KkFacetGrid>
    </KkFacetFold>
  );
};
