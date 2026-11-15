import { useBeerDrinkDefaultMutation, useBeerDrinkRetireMutation } from '../api';
import type { BeerStockDrink } from '../schemas';
import type { BeerHub, BeerOpenHub } from './use-beer-hub';

export type DrinkPane =
  | { kind: 'missing' }
  | {
      kind: 'listed';
      drink: BeerStockDrink;
      canRetire: boolean;
      retiring: boolean;
      retire: () => void;
      canMakeDefault: boolean;
      makingDefault: boolean;
      makeDefault: () => void;
    };

export const useDrinkPane = (hub: BeerHub, open: BeerOpenHub, beerDrinkId: number): DrinkPane => {
  const retiring = useBeerDrinkRetireMutation(open.pot.beerPotId);
  const defaulting = useBeerDrinkDefaultMutation(open.pot.beerPotId);
  const drink = open.listedDrinks.find((entry) => entry.beerDrinkId === beerDrinkId);

  if (drink === undefined) {
    return { kind: 'missing' };
  }

  const input = { beerDrinkId: drink.beerDrinkId, name: drink.name };

  return {
    kind: 'listed',
    drink,
    canRetire: drink.crates === 0,
    retiring: retiring.isPending,
    retire: () => {
      retiring.mutate(input, {
        onSuccess: () => {
          hub.openPane('/beer-list/manage/drinks');
        },
      });
    },
    canMakeDefault: !drink.isDefault,
    makingDefault: defaulting.isPending,
    makeDefault: () => {
      defaulting.mutate(input);
    },
  };
};
