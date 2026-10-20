import { KkStateGrid } from '@furria/ui';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { PANE_ICONS, toCellAriaLabel, toCellGridFact } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';

interface EventsGridCellProps {
  eventId: number;
  eventTitle: string;
  cell: BoardCell;
  selectedPane: EventPaneKey | null;
  compact: boolean;
  onSelect: (eventId: number, pane: EventPaneKey) => void;
}

export const EventsGridCell: FC<EventsGridCellProps> = ({
  eventId,
  eventTitle,
  cell,
  selectedPane,
  compact,
  onSelect,
}) => {
  const fact = toCellGridFact(cell.fact);
  const label = toCellAriaLabel(eventTitle, cell);
  const select = (): void => {
    onSelect(eventId, cell.pane);
  };

  return (
    <KkStateGrid.Cell
      icon={PANE_ICONS[cell.pane]}
      state={cell.state}
      fact={fact}
      label={label}
      selected={cell.pane === selectedPane}
      compact={compact}
      onSelect={select}
    />
  );
};
