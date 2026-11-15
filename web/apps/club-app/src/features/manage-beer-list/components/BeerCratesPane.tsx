import type { FC } from 'react';
import { bookableOf } from '../beer-hub';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { FORM_TITLES } from '../beer-hub-copy';
import { HUB_LANDING } from '../beer-landing';
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
        drinks={open.listedDrinks}
        initialPersonId={initialPersonId}
        landing={HUB_LANDING}
      />
    );

  return (
    <BeerPaneFrame icon="add" title={FORM_TITLES.crates}>
      {body}
    </BeerPaneFrame>
  );
};
