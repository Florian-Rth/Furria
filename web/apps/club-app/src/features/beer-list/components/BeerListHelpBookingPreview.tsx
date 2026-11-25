import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkTabCount } from '@furria/ui/KkTabCount';
import { KkTabHold } from '@furria/ui/KkTabHold';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  bookConfirm,
  bookLabel,
  COUNT_LABEL,
  countCaption,
  cratesLabel,
  DRINK_LABEL,
  drinkChoicesOf,
  HOLD_HINT,
} from '../booking/booking-copy';
import { BEER_COUNTS } from '../booking/booking-window';
import type { BeerPotDrink } from '../schemas';

const SAMPLE_DRINKS: readonly BeerPotDrink[] = [
  { beerDrinkId: 1, name: 'Veltins', cratePriceCents: 1800, hasStock: true, isDefault: true },
  { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
];
const SAMPLE_DRINK = 'Veltins';
const SAMPLE_COUNT = 1;
const SAMPLE_CHOICES = drinkChoicesOf(SAMPLE_DRINKS);
const SAMPLE_CHOSEN = '1';
const SAMPLE_CONFIRM = bookConfirm(SAMPLE_COUNT, SAMPLE_DRINK);
const SAMPLE_HOLD_LABEL = bookLabel(SAMPLE_COUNT);

const OPTIONS = BEER_COUNTS.map((value) => ({
  value,
  label: cratesLabel(value),
  caption: countCaption(value),
}));

const keep = (): void => {};

export const BeerListHelpBookingPreview: FC = () => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkChoiceChips
      label={DRINK_LABEL}
      choices={SAMPLE_CHOICES}
      value={SAMPLE_CHOSEN}
      onChange={keep}
    />
    <Stack direction="row" sx={{ gap: 1, minWidth: 0 }}>
      <KkTabCount
        label={COUNT_LABEL}
        options={OPTIONS}
        value={SAMPLE_COUNT}
        onChange={keep}
        sx={{ flex: '0 0 40%' }}
      />
      <KkTabHold
        label={SAMPLE_HOLD_LABEL}
        hint={HOLD_HINT}
        confirm={SAMPLE_CONFIRM}
        onCommit={keep}
        sx={{ flex: 1 }}
      />
    </Stack>
  </Stack>
);
