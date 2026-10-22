import { KkStateCard } from '@furria/ui/KkStateCard';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { PANE_ICONS, toCellAriaLabel, toCellShortFact } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';

interface EventsCardCellProps {
  eventId: number;
  eventTitle: string;
  cell: BoardCell;
  onSelect: (eventId: number, pane: EventPaneKey) => void;
}

export const EventsCardCell: FC<EventsCardCellProps> = ({
  eventId,
  eventTitle,
  cell,
  onSelect,
}) => {
  const ariaLabel = toCellAriaLabel(eventTitle, cell);
  const fact = toCellShortFact(cell.fact);
  const select = (): void => {
    onSelect(eventId, cell.pane);
  };

  return (
    <KkStateCard.Cell
      icon={PANE_ICONS[cell.pane]}
      state={cell.state}
      fact={fact}
      ariaLabel={ariaLabel}
      onSelect={select}
    />
  );
};
