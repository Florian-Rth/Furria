import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerBooking } from '../use-beer-booking';
import { BeerBookingFailure } from './BeerBookingFailure';
import { BeerBookingOffer } from './BeerBookingOffer';
import { BeerBookingUndo } from './BeerBookingUndo';

interface BeerBookingControlProps {
  booking: BeerBooking;
}

export const BeerBookingControl: FC<BeerBookingControlProps> = ({ booking }) => {
  const control =
    booking.phase === 'undo' ? (
      <BeerBookingUndo booking={booking} />
    ) : (
      <BeerBookingOffer booking={booking} />
    );

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      {control}
      <BeerBookingFailure booking={booking} />
    </Stack>
  );
};
