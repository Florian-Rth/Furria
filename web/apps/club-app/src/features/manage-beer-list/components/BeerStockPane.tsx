import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { cratesLabel, FORM_TITLES } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerStockForm } from './BeerStockForm';

export const BeerStockPane: FC = () => {
  const open = openHubOf(useBeerHubContext());
  const context = open === null ? '' : cratesLabel(open.summary.stock);
  const body =
    open === null ? null : (
      <BeerStockForm beerPotId={open.pot.beerPotId} drinks={open.listedDrinks} />
    );

  return (
    <BeerPaneFrame icon="beer" title={FORM_TITLES.stock} context={context}>
      {body}
    </BeerPaneFrame>
  );
};
