import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ADD_DRINK_LABEL, DRINKS_SECTION, RETIRED_SECTION, retiredLineOf } from '../beer-hub-copy';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import { BeerDrinkAddForm } from './BeerDrinkAddForm';
import { BeerDrinkRow } from './BeerDrinkRow';

interface BeerDrinksBodyProps {
  open: BeerOpenHub;
}

export const BeerDrinksBody: FC<BeerDrinksBodyProps> = ({ open }) => {
  const rows = open.listedDrinks.map((drink) => (
    <BeerDrinkRow key={drink.beerDrinkId} drink={drink} />
  ));
  const retiredNames = open.drinks.filter((drink) => drink.isRetired).map((drink) => drink.name);
  const retiredLine = retiredLineOf(retiredNames);
  const retired =
    retiredNames.length === 0 ? null : (
      <Stack>
        <KkPourDay label={RETIRED_SECTION} facts="" />
        <KkMeta>{retiredLine}</KkMeta>
      </Stack>
    );
  const drinkCount = String(open.listedDrinks.length);

  return (
    <>
      <Stack>
        <KkPourDay label={DRINKS_SECTION} facts={drinkCount} />
        <KkPanel>{rows}</KkPanel>
      </Stack>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkPourDay label={ADD_DRINK_LABEL} facts="" />
        <BeerDrinkAddForm beerPotId={open.pot.beerPotId} />
      </Stack>
      {retired}
    </>
  );
};
