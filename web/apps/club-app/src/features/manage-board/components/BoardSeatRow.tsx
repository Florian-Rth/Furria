import { KkAvatar, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { toInitials } from '@/lib/initials';
import { SEAT_PERIOD_LABEL, toPersonName, toSeatPeriodLabel } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const SEAT_ROUTE = '/manage/board/$boardOfficeId/seats/$boardSeatId';

interface BoardSeatRowProps {
  boardOfficeId: number;
  seat: BoardSeat;
  highlightedKey: string | null;
}

export const BoardSeatRow: FC<BoardSeatRowProps> = ({ boardOfficeId, seat, highlightedKey }) => {
  const name = toPersonName(seat);
  const landing = toLandingKey('board-seat', seat.boardSeatId);

  const avatar = (
    <KkAvatar initials={toInitials(seat.firstName, seat.lastName)} size="small" component="span" />
  );

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SEAT_PERIOD_LABEL}
      sinceValue={toSeatPeriodLabel(seat, toIsoDay(new Date()))}
      component={Link}
      to={SEAT_ROUTE}
      params={{ boardOfficeId: String(boardOfficeId), boardSeatId: String(seat.boardSeatId) }}
      highlight={highlightedKey === landing}
      landing={landing}
    />
  );
};
