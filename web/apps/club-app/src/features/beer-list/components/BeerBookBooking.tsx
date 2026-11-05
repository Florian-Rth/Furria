import { KkTabStage } from '@furria/ui/KkTabStage';
import type { FC, ReactNode } from 'react';
import { BeerOpenTotal } from '../booking/components/BeerOpenTotal';
import { BeerTallyDisc } from '../booking/components/BeerTallyDisc';
import type { BeerBooking } from '../booking/use-beer-booking';
import type { BeerBookDone, BeerBookTally } from '../hooks/use-beer-book-page';
import { BeerBookBookingFoot } from './BeerBookBookingFoot';

const FIGURE_SX = { alignItems: 'flex-end' } as const;
const NO_BURST = 0;

interface BeerBookBookingProps {
  head: ReactNode;
  tally: BeerBookTally;
  booking: BeerBooking;
  done: BeerBookDone;
}

export const BeerBookBooking: FC<BeerBookBookingProps> = ({ head, tally, booking, done }) => {
  const { celebration } = booking;
  const quietRoll = { ...celebration, burstKey: NO_BURST };
  const figure = tally.hasCrates ? (
    <BeerOpenTotal
      openCents={tally.totals.openCents}
      celebration={quietRoll}
      detail={tally.payWays}
      size="small"
      sx={FIGURE_SX}
    />
  ) : null;

  return (
    <>
      <KkTabStage.Top>
        {head}
        {figure}
      </KkTabStage.Top>
      <KkTabStage.Middle>
        <BeerTallyDisc
          strokes={tally.strokes}
          totals={tally.totals}
          drawKey={celebration.spin}
          burstKey={celebration.burstKey}
          size="large"
        />
      </KkTabStage.Middle>
      <KkTabStage.Foot>
        <BeerBookBookingFoot booking={booking} done={done} />
      </KkTabStage.Foot>
    </>
  );
};
