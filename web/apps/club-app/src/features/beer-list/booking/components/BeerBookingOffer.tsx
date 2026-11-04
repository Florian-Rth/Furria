import { KkMeta } from '@furria/ui/KkMeta';
import type { KkTabCountSize } from '@furria/ui/KkTabCount';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { priceNote } from '../booking-copy';
import type { BeerBookingChoosing } from '../use-beer-booking';
import { BeerBookingChoose } from './BeerBookingChoose';

interface BeerBookingOfferProps {
  booking: BeerBookingChoosing;
  size?: KkTabCountSize;
}

export const BeerBookingOffer: FC<BeerBookingOfferProps> = ({ booking, size }) => {
  const priceLine = priceNote(formatEuroCents(booking.priceCents));

  return (
    <>
      <BeerBookingChoose booking={booking} size={size} />
      <KkMeta>{priceLine}</KkMeta>
    </>
  );
};
