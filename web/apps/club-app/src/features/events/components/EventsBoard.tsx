import { KkStateGrid } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  GRID_COLUMNS,
  GRID_COUNT_LABEL,
  GRID_DATE_LABEL,
  GRID_EVENT_LABEL,
  GRID_LABEL,
} from '../event-board-copy';
import type { BoardRow } from '../hooks/use-events-board';
import type { PaneSelection } from '../hooks/use-pane-selection';
import type { EventPaneKey } from '../schemas';
import { EventsCard } from './EventsCard';
import { EventsGridRow } from './EventsGridRow';

interface EventsBoardProps {
  rows: readonly BoardRow[];
  isTable: boolean;
  compact: boolean;
  selection: PaneSelection | null;
  onSelect: (eventId: number, pane: EventPaneKey) => void;
}

const selectedPaneOf = (selection: PaneSelection | null, eventId: number): EventPaneKey | null =>
  selection?.eventId === eventId ? selection.pane : null;

export const EventsBoard: FC<EventsBoardProps> = ({
  rows,
  isTable,
  compact,
  selection,
  onSelect,
}) => {
  if (!isTable) {
    const cards = rows.map((row) => (
      <EventsCard key={row.event.eventId} row={row} onSelect={onSelect} />
    ));

    return <Stack sx={{ gap: 1.25, minWidth: 0 }}>{cards}</Stack>;
  }

  const gridRows = rows.map((row) => {
    const selectedPane = selectedPaneOf(selection, row.event.eventId);

    return (
      <EventsGridRow
        key={row.event.eventId}
        row={row}
        selectedPane={selectedPane}
        compact={compact}
        onSelect={onSelect}
      />
    );
  });

  return (
    <KkStateGrid
      label={GRID_LABEL}
      dateLabel={GRID_DATE_LABEL}
      eventLabel={GRID_EVENT_LABEL}
      countLabel={GRID_COUNT_LABEL}
      columns={GRID_COLUMNS}
      compact={compact}
    >
      {gridRows}
    </KkStateGrid>
  );
};
