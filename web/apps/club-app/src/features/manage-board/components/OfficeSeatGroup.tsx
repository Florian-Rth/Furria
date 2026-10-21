import { KkMeta, KkPanelSection, KkSeatList } from '@furria/ui';
import type { FC } from 'react';
import type { BoardSeat } from '../schemas';
import { OfficeSeatLine } from './OfficeSeatLine';

interface OfficeSeatGroupProps {
  title: string;
  seats: readonly BoardSeat[];
  emptyNote?: string;
  today: string;
  canEnd: boolean;
  onEnd: (boardSeatId: number) => void;
}

export const OfficeSeatGroup: FC<OfficeSeatGroupProps> = ({
  title,
  seats,
  emptyNote,
  today,
  canEnd,
  onEnd,
}) => {
  if (seats.length === 0 && emptyNote === undefined) {
    return null;
  }

  const lines = seats.map((seat) => (
    <OfficeSeatLine
      key={seat.boardSeatId}
      seat={seat}
      today={today}
      canEnd={canEnd}
      onEnd={onEnd}
    />
  ));
  const count = seats.length === 0 ? undefined : seats.length;
  const body =
    seats.length === 0 ? (
      <KkMeta>{emptyNote}</KkMeta>
    ) : (
      <KkSeatList label={title}>{lines}</KkSeatList>
    );

  return (
    <KkPanelSection title={title} meta={count}>
      {body}
    </KkPanelSection>
  );
};
