import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { GATE_NOTES } from '../beer-list-copy';
import { BEER_LIST_HELP_SPOTS } from '../beer-list-help-copy';
import type { BeerBookingGate } from '../booking/booking-gate';
import { BeerBookingControl } from '../booking/components/BeerBookingControl';
import type { BeerBooking } from '../booking/use-beer-booking';

interface BeerListActionProps {
  gate: BeerBookingGate;
  booking: BeerBooking;
}

export const BeerListAction: FC<BeerListActionProps> = ({ gate, booking }) => {
  if (gate === 'open') {
    return <BeerBookingControl booking={booking} landing={BEER_LIST_HELP_SPOTS.booking} />;
  }

  return <KkNote icon="info">{GATE_NOTES[gate]}</KkNote>;
};
