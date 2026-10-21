import type { FC } from 'react';
import type { SeatFormTarget } from '../hooks/use-seat-form-target';
import type { BoardOffice } from '../schemas';
import { SeatEndPane } from './SeatEndPane';
import { SeatOpenPane } from './SeatOpenPane';

interface SeatFormPaneProps {
  target: SeatFormTarget;
  offices: readonly BoardOffice[];
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const SeatFormPane: FC<SeatFormPaneProps> = ({
  target,
  offices,
  today,
  framed,
  onClose,
}) => {
  const office = offices.find((candidate) => candidate.boardOfficeId === target.boardOfficeId);

  if (office === undefined) {
    return null;
  }

  if (target.mode === 'open') {
    const key = `open-${office.boardOfficeId}-${target.sinceOn}`;

    return (
      <SeatOpenPane
        key={key}
        office={office}
        defaultSinceOn={target.sinceOn}
        today={today}
        framed={framed}
        onClose={onClose}
      />
    );
  }

  const seat = office.seats.find((candidate) => candidate.boardSeatId === target.boardSeatId);

  if (seat === undefined) {
    return null;
  }

  return (
    <SeatEndPane
      key={seat.boardSeatId}
      office={office}
      seat={seat}
      today={today}
      framed={framed}
      onClose={onClose}
    />
  );
};
