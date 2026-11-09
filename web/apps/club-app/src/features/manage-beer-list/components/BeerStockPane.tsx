import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { FORM_TITLES } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerStockForm } from './BeerStockForm';

export const BeerStockPane: FC = () => {
  const open = openHubOf(useBeerHubContext());
  const body = open === null ? null : <BeerStockForm pot={open.pot} stock={open.summary.stock} />;

  return (
    <BeerPaneFrame icon="edit" title={FORM_TITLES.stock}>
      {body}
    </BeerPaneFrame>
  );
};
