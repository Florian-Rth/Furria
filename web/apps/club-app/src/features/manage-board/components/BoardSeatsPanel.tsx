import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toVacantDescription, VACANT_TITLE } from '../manage-board-labels';
import { BoardSeatRow } from './BoardSeatRow';

interface BoardSeatsPanelProps {
  entry: BoardOfficeEntry;
  onEnd: (boardSeatId: number) => void;
}

export const BoardSeatsPanel: FC<BoardSeatsPanelProps> = ({ entry, onEnd }) => {
  if (entry.seats.length === 0) {
    return (
      <KkPanel variant="block" dimmed={entry.isArchived}>
        <KkEmptyState
          size="panel"
          title={VACANT_TITLE}
          description={toVacantDescription(entry.name)}
        />
      </KkPanel>
    );
  }

  const rows = entry.seats.map((seat) => (
    <BoardSeatRow key={seat.boardSeatId} seat={seat} canEnd={!entry.isArchived} onEnd={onEnd} />
  ));

  return <KkPanel variant="list">{rows}</KkPanel>;
};
