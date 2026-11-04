import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { ownerContextOf, SETTINGS_TITLE } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsForm } from './BeerSettingsForm';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/manage/beer-list/settings" />;

export const BeerSettingsPane: FC = () => {
  const open = openHubOf(useBeerHubContext());
  const context = open === null ? '' : ownerContextOf(open.pot.owner);
  const body = open === null ? null : <BeerSettingsForm pot={open.pot} />;

  return (
    <BeerPaneFrame switcher={SWITCHER} icon="settings" title={SETTINGS_TITLE} context={context}>
      {body}
    </BeerPaneFrame>
  );
};
