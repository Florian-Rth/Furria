import type { BeerPotDrink } from '../schemas';

const presetDrinkOf = (inStock: readonly BeerPotDrink[]): BeerPotDrink | null => {
  const preferred = inStock.find((drink) => drink.isDefault);

  if (preferred !== undefined) {
    return preferred;
  }

  const [only] = inStock;

  return inStock.length === 1 && only !== undefined ? only : null;
};

export const pickedDrinkOf = (
  drinks: readonly BeerPotDrink[],
  pickedId: number | null,
): BeerPotDrink | null => {
  const inStock = drinks.filter((drink) => drink.hasStock);
  const picked = inStock.find((drink) => drink.beerDrinkId === pickedId);

  return picked ?? presetDrinkOf(inStock);
};
