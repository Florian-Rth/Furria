import type { KkTabCountSize } from '@furria/ui/KkTabCount';
import type { FC } from 'react';
import type { BeerBookingChoosing } from '../use-beer-booking';
import { BeerBookingChoose } from './BeerBookingChoose';
import { BeerDrinkChoice } from './BeerDrinkChoice';

interface BeerBookingOfferProps {
  booking: BeerBookingChoosing;
  size?: KkTabCountSize;
}

export const BeerBookingOffer: FC<BeerBookingOfferProps> = ({ booking, size }) => (
  <>
    <BeerDrinkChoice booking={booking} />
    <BeerBookingChoose booking={booking} size={size} />
  </>
);
