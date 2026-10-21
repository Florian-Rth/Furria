import { KkMeta, KkPanelSection, KkWorkQueue } from '@furria/ui';
import type { FC } from 'react';
import type { QueueItem } from '../board-hub';
import { canSeatOffice } from '../board-hub';
import { FILTER_EMPTY, OPEN_EMPTY, OPEN_TITLE, QUEUE_LABEL } from '../board-hub-copy';
import type { BoardFilter, BoardOffice } from '../schemas';
import { BoardItemRow } from './BoardItemRow';

interface BoardOpenProps {
  items: readonly QueueItem[];
  offices: readonly BoardOffice[];
  filter: BoardFilter;
  today: string;
  canManageRoles: boolean;
  selectedId: number | null;
  highlightedKey: string | null;
  onOpen: (boardOfficeId: number) => void;
  onSeat: (boardOfficeId: number, sinceOn: string) => void;
}

export const BoardOpen: FC<BoardOpenProps> = ({
  items,
  offices,
  filter,
  today,
  canManageRoles,
  selectedId,
  highlightedKey,
  onOpen,
  onSeat,
}) => {
  const rows = items.flatMap((item) => {
    const office = offices.find((candidate) => candidate.boardOfficeId === item.boardOfficeId);

    return office === undefined
      ? []
      : [
          <BoardItemRow
            highlightedKey={highlightedKey}
            key={item.key}
            item={item}
            office={office}
            today={today}
            canSeat={canSeatOffice(office, canManageRoles)}
            selected={selectedId === office.boardOfficeId}
            onOpen={onOpen}
            onSeat={onSeat}
          />,
        ];
  });
  const emptyNote = filter === 'all' ? OPEN_EMPTY : FILTER_EMPTY;
  const list =
    rows.length === 0 ? (
      <KkMeta>{emptyNote}</KkMeta>
    ) : (
      <KkWorkQueue label={QUEUE_LABEL}>{rows}</KkWorkQueue>
    );

  return (
    <KkPanelSection title={OPEN_TITLE} meta={rows.length}>
      {list}
    </KkPanelSection>
  );
};
