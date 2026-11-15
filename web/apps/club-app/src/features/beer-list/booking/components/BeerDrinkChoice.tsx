import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import type { FC } from 'react';
import { DRINK_LABEL, drinkChoicesOf } from '../booking-copy';
import type { BeerBookingChoosing } from '../use-beer-booking';

interface BeerDrinkChoiceProps {
  booking: BeerBookingChoosing;
}

export const BeerDrinkChoice: FC<BeerDrinkChoiceProps> = ({ booking }) => {
  const choices = drinkChoicesOf(booking.drinks);
  const value = booking.drink === null ? null : String(booking.drink.beerDrinkId);
  const choose = (id: string): void => {
    booking.chooseDrink(Number(id));
  };

  return <KkChoiceChips label={DRINK_LABEL} choices={choices} value={value} onChange={choose} />;
};
