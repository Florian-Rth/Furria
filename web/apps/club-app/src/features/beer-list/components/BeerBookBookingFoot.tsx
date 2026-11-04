import type { FC } from 'react';
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

export const BeerBookBookingFoot: FC<BeerBookBookingFootProps> = ({ booking, done }) => {
  const failure = <BeerBookingFailure booking={booking} />;

  if (booking.phase === 'undo') {
    return (
      <>
        <BeerBookingUndo booking={booking} variant="stage" />
        {failure}
      </>
    );
  }

  if (done.isDone) {
    return (
      <>
        <BeerBookDoneNote line={done.line} onAgain={done.again} />
        {failure}
      </>
    );
  }

  return (
    <>
      <BeerBookingOffer booking={booking} size="large" />
      {failure}
    </>
  );
};
