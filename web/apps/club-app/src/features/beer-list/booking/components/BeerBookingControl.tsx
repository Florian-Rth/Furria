import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { BeerBooking } from '../use-beer-booking';
import { BeerBookingEmpty } from './BeerBookingEmpty';
import { BeerBookingFailure } from './BeerBookingFailure';
import { BeerBookingOffer } from './BeerBookingOffer';
import { BeerBookingUndo } from './BeerBookingUndo';

interface BeerBookingControlProps {
  booking: BeerBooking;
  landing?: string;
}

const controlOf = (booking: BeerBooking): ReactNode => {
  switch (booking.phase) {
    case 'undo':
      return <BeerBookingUndo booking={booking} />;
    case 'empty':
      return <BeerBookingEmpty />;
    default:
      return <BeerBookingOffer booking={booking} />;
  }
};

export const BeerBookingControl: FC<BeerBookingControlProps> = ({ booking, landing }) => {
  const control = controlOf(booking);

  return (
    <Stack data-kk-landing={landing} sx={{ gap: 1, minWidth: 0 }}>
      {control}
      <BeerBookingFailure booking={booking} />
    </Stack>
  );
};
