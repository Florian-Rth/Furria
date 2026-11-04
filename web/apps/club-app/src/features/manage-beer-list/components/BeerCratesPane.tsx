import type { FC } from 'react';
import { bookableOf } from '../beer-hub';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { FORM_CONTEXTS, FORM_TITLES } from '../beer-hub-copy';
import { BeerCratesForm } from './BeerCratesForm';
import { BeerPaneFrame } from './BeerPaneFrame';

interface BeerCratesPaneProps {
  initialPersonId: number | null;
}

export const BeerCratesPane: FC<BeerCratesPaneProps> = ({ initialPersonId }) => {
  const hub = useBeerHubContext();
  const open = openHubOf(hub);
  const bookable = bookableOf(hub.enrollments);
  const body =
    open === null ? null : (
      <BeerCratesForm
        beerPotId={open.pot.beerPotId}
        bookable={bookable}
        initialPersonId={initialPersonId}
        stock={open.summary.stock}
      />
    );

  return (
    <BeerPaneFrame icon="add" title={FORM_TITLES.crates} context={FORM_CONTEXTS.crates}>
      {body}
    </BeerPaneFrame>
  );
};
