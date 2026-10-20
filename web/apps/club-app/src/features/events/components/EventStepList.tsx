import { KkStepList, useKkSheetCommands } from '@furria/ui';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { LATER_EYEBROW, LATER_ITEMS, STEPS_LABEL } from '../event-board-copy';
import { LATER_SHEET_ID } from '../event-plan-copy';
import type { EventDetails, EventPaneKey } from '../schemas';
import { EventStepRow } from './EventStepRow';

interface EventStepListProps {
  event: EventDetails;
  cells: readonly BoardCell[];
  pane: EventPaneKey | null;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventStepList: FC<EventStepListProps> = ({ event, cells, pane, onChoose }) => {
  const sheet = useKkSheetCommands();
  const openLater = (): void => {
    sheet.open(LATER_SHEET_ID);
  };
  const steps = cells.map((cell) => (
    <EventStepRow
      key={cell.column}
      event={event}
      cell={cell}
      selectedPane={pane}
      onChoose={onChoose}
    />
  ));

  return (
    <KkStepList label={STEPS_LABEL}>
      {steps}
      <KkStepList.Later eyebrow={LATER_EYEBROW} items={LATER_ITEMS} onSelect={openLater} />
    </KkStepList>
  );
};
