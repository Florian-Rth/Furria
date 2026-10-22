import { KkStateGrid } from '@furria/ui/KkStateGrid';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toRowView } from '../event-board-copy';
import type { BoardRow } from '../hooks/use-events-board';
import type { EventPaneKey } from '../schemas';
import { EventCountdown } from './EventCountdown';
import { EventDueChip } from './EventDueChip';
import { EventsGridCell } from './EventsGridCell';
import { EventsRowBadge } from './EventsRowBadge';
import { EventThumb } from './EventThumb';

interface EventsGridRowProps {
  row: BoardRow;
  selectedPane: EventPaneKey | null;
  compact: boolean;
  onSelect: (eventId: number, pane: EventPaneKey) => void;
}

export const EventsGridRow: FC<EventsGridRowProps> = ({ row, selectedPane, compact, onSelect }) => {
  const { event, cells, daysLeft } = row;
  const view = toRowView(event, daysLeft);
  const params = { eventId: String(event.eventId) };
  const shownCells = cells.map((cell) => (
    <EventsGridCell
      key={cell.pane}
      eventId={event.eventId}
      eventTitle={event.title}
      cell={cell}
      selectedPane={selectedPane}
      compact={compact}
      onSelect={onSelect}
    />
  ));

  return (
    <KkStateGrid.Row
      day={view.day}
      dayLabel={view.dayLabel}
      title={event.title}
      meta={view.meta}
      media={
        <EventThumb
          eventId={event.eventId}
          picture={event.picture}
          cancelled={view.cancelled}
          shape="wide"
        />
      }
      badge={<EventsRowBadge event={event} />}
      due={<EventDueChip due={row.due} />}
      countdown={<EventCountdown view={view} remaining={row.remaining} />}
      cancelled={view.cancelled}
      dimmed={view.dimmed}
      selected={selectedPane !== null}
      component={Link}
      to="/events/$eventId"
      params={params}
    >
      {shownCells}
    </KkStateGrid.Row>
  );
};
