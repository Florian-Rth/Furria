import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toRosterSince } from '../board-hub-copy';
import { toPersonName } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

interface BoardRosterSeatProps {
  seat: BoardSeat;
  compact: boolean;
}

export const BoardRosterSeat: FC<BoardRosterSeatProps> = ({ seat, compact }) => {
  const initials = toInitials(seat.firstName, seat.lastName);
  const name = toPersonName(seat);
  const since = toRosterSince(seat, compact);
  const sinceTone = seat.untilOn === null ? 'ink' : 'attention';

  return <KkRoster.Seat initials={initials} name={name} since={since} sinceTone={sinceTone} />;
};
