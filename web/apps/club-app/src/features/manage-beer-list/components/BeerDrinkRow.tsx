import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { DEFAULT_MARK, drinkFactsOf } from '../beer-hub-copy';
import { drinkPathOf } from '../beer-landing';
import type { BeerStockDrink } from '../schemas';

interface BeerDrinkRowProps {
  drink: BeerStockDrink;
}

export const BeerDrinkRow: FC<BeerDrinkRowProps> = ({ drink }) => {
  const meta = drinkFactsOf(drink.crates, drink.cratePriceCents);
  const hint = drink.isDefault ? DEFAULT_MARK : undefined;
  const to = drinkPathOf(drink.beerDrinkId);

  return (
    <KkHubRow
      label={drink.name}
      icon="beer"
      meta={meta}
      hint={hint}
      hintTone="blue"
      component={Link}
      to={to}
    />
  );
};
