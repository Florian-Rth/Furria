import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  DRINK_LABEL,
  DRINK_UNKNOWN,
  drinkFactsOf,
  drinkStateLabelOf,
  EDIT_DRINK_SECTION,
  HOLD_HINT,
  MAKE_DEFAULT_LABEL,
  RETIRE_LABEL,
  retireConfirmOf,
} from '../beer-hub-copy';
import type { BeerHub, BeerOpenHub } from '../hooks/use-beer-hub';
import { useDrinkPane } from '../hooks/use-drink-pane';
import { BeerDrinkEditForm } from './BeerDrinkEditForm';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/beer-list/manage/drinks" />;

interface BeerDrinkPaneOpenProps {
  hub: BeerHub;
  open: BeerOpenHub;
  beerDrinkId: number;
}

export const BeerDrinkPaneOpen: FC<BeerDrinkPaneOpenProps> = ({ hub, open, beerDrinkId }) => {
  const pane = useDrinkPane(hub, open, beerDrinkId);

  if (pane.kind === 'missing') {
    return (
      <BeerPaneFrame switcher={SWITCHER} icon="beer" title={DRINK_LABEL}>
        <KkText variant="body2" tone="secondary">
          {DRINK_UNKNOWN}
        </KkText>
      </BeerPaneFrame>
    );
  }

  const { drink } = pane;
  const context = drinkFactsOf(drink.crates, drink.cratePriceCents);
  const stateLabel = drinkStateLabelOf(drink.isDefault);
  const state = drink.isDefault ? 'current' : 'open';
  const confirm = retireConfirmOf(drink.name);
  const makeDefault = pane.canMakeDefault ? (
    <KkButton variant="outlined" loading={pane.makingDefault} onClick={pane.makeDefault}>
      {MAKE_DEFAULT_LABEL}
    </KkButton>
  ) : null;
  const retire = pane.canRetire ? (
    <KkHoldButton
      label={RETIRE_LABEL}
      hint={HOLD_HINT}
      tone="danger"
      confirm={confirm}
      disabled={pane.retiring}
      onCommit={pane.retire}
    />
  ) : null;

  return (
    <BeerPaneFrame
      switcher={SWITCHER}
      icon="beer"
      title={drink.name}
      context={context}
      state={state}
      stateLabel={stateLabel}
    >
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkPourDay label={EDIT_DRINK_SECTION} facts="" />
        <BeerDrinkEditForm beerPotId={open.pot.beerPotId} drink={drink} />
      </Stack>
      {makeDefault}
      {retire}
    </BeerPaneFrame>
  );
};
