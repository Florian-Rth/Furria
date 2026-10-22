import { KkTenureChainRow } from '@furria/ui/KkTenureChainRow';
import type { FC } from 'react';
import { seatPhaseOf } from '../board-hub';
import { toChainSpan, toChainState, toChainStateLabel } from '../board-hub-copy';
import { toPersonName } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

interface OfficeChainRowProps {
  seat: BoardSeat;
  today: string;
}

export const OfficeChainRow: FC<OfficeChainRowProps> = ({ seat, today }) => {
  const phase = seatPhaseOf(seat, today);
  const state = toChainState(phase);
  const name = toPersonName(seat);
  const span = toChainSpan(seat, phase);
  const stateLabel = toChainStateLabel(state);

  return <KkTenureChainRow name={name} span={span} state={state} stateLabel={stateLabel} />;
};
