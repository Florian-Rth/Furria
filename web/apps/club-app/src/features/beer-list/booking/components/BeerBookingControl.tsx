import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { priceNote } from '../booking-copy';
import type { BeerBooking } from '../use-beer-booking';
import { BeerBookingChoose } from './BeerBookingChoose';
import { BeerBookingFailure } from './BeerBookingFailure';
import { BeerBookingUndo } from './BeerBookingUndo';

interface BeerBookingControlProps {
  booking: BeerBooking;
}

export const BeerBookingControl: FC<BeerBookingControlProps> = ({ booking }) => {
  const priceLine = priceNote(formatEuroCents(booking.priceCents));
  const control =
    booking.phase === 'undo' ? (
      <BeerBookingUndo booking={booking} />
    ) : (
      <>
        <BeerBookingChoose booking={booking} />
        <KkMeta>{priceLine}</KkMeta>
      </>
    );

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      {control}
      <BeerBookingFailure booking={booking} />
    </Stack>
  );
};
