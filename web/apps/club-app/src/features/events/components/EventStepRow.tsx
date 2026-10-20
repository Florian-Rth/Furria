import { KkStepList } from '@furria/ui';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { PANE_ICONS, PANE_TITLES, toCellFactLabel, toCellStateLabel } from '../event-board-copy';
import { toStepDue } from '../event-pane-copy';
import type { EventDetails, EventPaneKey } from '../schemas';

interface EventStepRowProps {
  event: EventDetails;
  cell: BoardCell;
  selectedPane: EventPaneKey | null;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventStepRow: FC<EventStepRowProps> = ({ event, cell, selectedPane, onChoose }) => {
  const stateLabel = toCellStateLabel(cell);
  const fact = toCellFactLabel(cell.fact);
  const due = toStepDue(event, cell);
  const selected = cell.pane === selectedPane;
  const choose = (): void => {
    onChoose(cell.pane);
  };

  return (
    <KkStepList.Step
      icon={PANE_ICONS[cell.pane]}
      title={PANE_TITLES[cell.pane]}
      state={cell.state}
      stateLabel={stateLabel}
      fact={fact}
      due={due}
      selected={selected}
      onSelect={choose}
    />
  );
};
