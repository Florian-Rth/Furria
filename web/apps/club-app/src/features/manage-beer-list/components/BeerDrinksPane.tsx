import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { DRINKS_SECTION, drinksContextOf } from '../beer-hub-copy';
import { BeerDrinksBody } from './BeerDrinksBody';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/beer-list/manage/drinks" />;

export const BeerDrinksPane: FC = () => {
  const open = openHubOf(useBeerHubContext());
  const context = open === null ? '' : drinksContextOf(open.listedDrinks.length);
  const body = open === null ? null : <BeerDrinksBody open={open} />;

  return (
    <BeerPaneFrame switcher={SWITCHER} icon="beer" title={DRINKS_SECTION} context={context}>
      {body}
    </BeerPaneFrame>
  );
};
