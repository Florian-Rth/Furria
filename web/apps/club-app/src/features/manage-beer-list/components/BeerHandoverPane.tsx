import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { HANDOVER_TITLE, ownerContextOf } from '../beer-hub-copy';
import { BeerHandoverForm } from './BeerHandoverForm';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/manage/beer-list/handover" />;

export const BeerHandoverPane: FC = () => {
  const open = openHubOf(useBeerHubContext());
  const context = open === null ? '' : ownerContextOf(open.pot.owner);
  const body =
    open === null ? null : (
      <BeerHandoverForm beerPotId={open.pot.beerPotId} stock={open.summary.stock} />
    );

  return (
    <BeerPaneFrame switcher={SWITCHER} icon="handshake" title={HANDOVER_TITLE} context={context}>
      {body}
    </BeerPaneFrame>
  );
};
