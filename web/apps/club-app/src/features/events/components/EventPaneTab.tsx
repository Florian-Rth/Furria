import { KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { PANE_ICONS, toCellAriaLabel } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';

interface EventPaneTabProps {
  eventTitle: string;
  cell: BoardCell;
  selected: boolean;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventPaneTab: FC<EventPaneTabProps> = ({ eventTitle, cell, selected, onChoose }) => {
  const label = toCellAriaLabel(eventTitle, cell);
  const choose = (): void => {
    onChoose(cell.pane);
  };

  return (
    <KkStepPane.Tab
      icon={PANE_ICONS[cell.pane]}
      state={cell.state}
      label={label}
      selected={selected}
      onSelect={choose}
    />
  );
};
