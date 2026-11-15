import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { DRINK_LABEL } from '../beer-hub-copy';
import { BeerDrinkPaneOpen } from './BeerDrinkPaneOpen';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/beer-list/manage/drinks" />;

interface BeerDrinkPaneProps {
  beerDrinkId: number;
}

export const BeerDrinkPane: FC<BeerDrinkPaneProps> = ({ beerDrinkId }) => {
  const hub = useBeerHubContext();
  const open = openHubOf(hub);

  if (open === null) {
    return <BeerPaneFrame switcher={SWITCHER} icon="beer" title={DRINK_LABEL} />;
  }

  return <BeerDrinkPaneOpen hub={hub} open={open} beerDrinkId={beerDrinkId} />;
};
