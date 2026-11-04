import type { FC } from 'react';
import { POTS_TITLE, potFactsOf, potLabelOf } from '../beer-hub-copy';
import type { ClosedPotPane } from '../hooks/use-closed-pot-pane';
import { useClosedPotPane } from '../hooks/use-closed-pot-pane';
import { BeerClosedPotBody } from './BeerClosedPotBody';
import { BeerPaneFrame } from './BeerPaneFrame';

interface BeerClosedPotPaneProps {
  beerPotId: number;
}

const headOf = (pane: ClosedPotPane): { title: string; context: string } =>
  pane.kind === 'ready' && pane.pot !== null
    ? {
        title: potLabelOf(pane.pot.owner, pane.pot.openedAt, pane.pot.closedAt),
        context: potFactsOf(pane.pot.openTabs, pane.pot.openCents),
      }
    : { title: POTS_TITLE, context: '' };

export const BeerClosedPotPane: FC<BeerClosedPotPaneProps> = ({ beerPotId }) => {
  const pane = useClosedPotPane(beerPotId);
  const head = headOf(pane);

  return (
    <BeerPaneFrame icon="archive" title={head.title} context={head.context}>
      <BeerClosedPotBody beerPotId={beerPotId} pane={pane} />
    </BeerPaneFrame>
  );
};
