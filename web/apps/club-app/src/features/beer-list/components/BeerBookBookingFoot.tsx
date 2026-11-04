import type { FC, ReactNode } from 'react';
import { BeerBookingEmpty } from '../booking/components/BeerBookingEmpty';
import { BeerBookingFailure } from '../booking/components/BeerBookingFailure';
import { BeerBookingOffer } from '../booking/components/BeerBookingOffer';
import { BeerBookingUndo } from '../booking/components/BeerBookingUndo';
import type { BeerBooking } from '../booking/use-beer-booking';
import type { BeerBookDone } from '../hooks/use-beer-book-page';
import { BeerBookDoneNote } from './BeerBookDoneNote';

interface BeerBookBookingFootProps {
  booking: BeerBooking;
  done: BeerBookDone;
}

const footOf = (booking: BeerBooking, done: BeerBookDone): ReactNode => {
  if (booking.phase === 'undo') {
    return <BeerBookingUndo booking={booking} variant="stage" />;
  }
  if (done.isDone) {
    return <BeerBookDoneNote line={done.line} onAgain={done.again} />;
  }
  if (booking.phase === 'empty') {
    return <BeerBookingEmpty />;
  }

  return <BeerBookingOffer booking={booking} size="large" />;
};

export const BeerBookBookingFoot: FC<BeerBookBookingFootProps> = ({ booking, done }) => {
  const foot = footOf(booking, done);

  return (
    <>
      {foot}
      <BeerBookingFailure booking={booking} />
    </>
  );
};
