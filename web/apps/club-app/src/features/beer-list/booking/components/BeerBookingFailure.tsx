import { KkAlert } from '@furria/ui/KkAlert';
import type { FC } from 'react';
import type { BeerBooking } from '../use-beer-booking';

interface BeerBookingFailureProps {
  booking: BeerBooking;
}

export const BeerBookingFailure: FC<BeerBookingFailureProps> = ({ booking }) => {
  if (booking.failure === null) {
    return null;
  }

  return <KkAlert severity="warning">{booking.failure}</KkAlert>;
};
