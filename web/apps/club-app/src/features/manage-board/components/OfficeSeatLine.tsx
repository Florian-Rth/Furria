import { KkButton } from '@furria/ui/KkButton';
import type { KkSeatTone } from '@furria/ui/KkSeatLine';
import { KkSeatLine } from '@furria/ui/KkSeatLine';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import type { SeatPhase } from '../board-hub';
import { seatPhaseOf } from '../board-hub';
import { END_SEAT_LABEL, toSeatPeriod } from '../board-hub-copy';
import { toPersonName } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const PHASE_TONES: Record<SeatPhase, KkSeatTone> = {
  running: 'ink',
  ending: 'attention',
  planned: 'planned',
  past: 'past',
};

interface OfficeSeatLineProps {
  seat: BoardSeat;
  today: string;
  canEnd: boolean;
  onEnd: (boardSeatId: number) => void;
}

export const OfficeSeatLine: FC<OfficeSeatLineProps> = ({ seat, today, canEnd, onEnd }) => {
  const phase = seatPhaseOf(seat, today);
  const end = (): void => {
    onEnd(seat.boardSeatId);
  };
  const action =
    canEnd && phase === 'running' ? (
      <KkButton size="small" variant="text" onClick={end}>
        {END_SEAT_LABEL}
      </KkButton>
    ) : undefined;
  const initials = toInitials(seat.firstName, seat.lastName);
  const honours = toAvatarHonours(seat.honours);
  const name = toPersonName(seat);
  const period = toSeatPeriod(seat, phase);

  return (
    <KkSeatLine
      initials={initials}
      honours={honours}
      name={name}
      period={period}
      tone={PHASE_TONES[phase]}
      action={action}
    />
  );
};
