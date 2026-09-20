import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { toInitials } from '@/lib/initials';
import {
  SEAT_PERIOD_LABEL,
  toEndSeatLabel,
  toPersonName,
  toSeatPeriodLabel,
} from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const END_LABEL = 'Beenden';

interface BoardSeatRowProps {
  seat: BoardSeat;
  canEnd: boolean;
  onEnd: (boardSeatId: number) => void;
}

export const BoardSeatRow: FC<BoardSeatRowProps> = ({ seat, canEnd, onEnd }) => {
  const name = toPersonName(seat);

  const end = (): void => {
    onEnd(seat.boardSeatId);
  };

  const avatar = (
    <KkAvatar initials={toInitials(seat.firstName, seat.lastName)} size="small" component="span" />
  );

  const trailing = canEnd ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndSeatLabel(name)}
      onClick={end}
    >
      {END_LABEL}
    </KkButton>
  ) : undefined;

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SEAT_PERIOD_LABEL}
      sinceValue={toSeatPeriodLabel(seat, toIsoDay(new Date()))}
      trailing={trailing}
    />
  );
};
