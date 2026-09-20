import { KkFactRow, KkMeta, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatPeriod } from '@/lib/membership-labels';
import { PAST_SEATS_LABEL, toPersonName } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const LIST_GAP = 0.75;

interface BoardPastSeatsPanelProps {
  seats: readonly BoardSeat[];
}

export const BoardPastSeatsPanel: FC<BoardPastSeatsPanelProps> = ({ seats }) => {
  if (seats.length === 0) {
    return null;
  }

  const rows = seats.map((seat) => (
    <KkFactRow
      key={seat.boardSeatId}
      title={toPersonName(seat)}
      span={formatPeriod(seat.sinceOn, seat.untilOn)}
      tone="neutral"
    />
  ));

  return (
    <Stack sx={{ gap: LIST_GAP, minWidth: 0 }}>
      <KkMeta>{PAST_SEATS_LABEL}</KkMeta>
      <KkPanel variant="list">{rows}</KkPanel>
    </Stack>
  );
};
