import { KkStateCard } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toRowView } from '../event-board-copy';
import type { BoardRow } from '../hooks/use-events-board';
import type { EventPaneKey } from '../schemas';
import { EventCountdown } from './EventCountdown';
import { EventDueChip } from './EventDueChip';
import { EventsCardCell } from './EventsCardCell';
import { EventsRowBadge } from './EventsRowBadge';
import { EventThumb } from './EventThumb';

interface EventsCardProps {
  row: BoardRow;
  onSelect: (eventId: number, pane: EventPaneKey) => void;
}

export const EventsCard: FC<EventsCardProps> = ({ row, onSelect }) => {
  const { event, cells, daysLeft } = row;
  const view = toRowView(event, daysLeft);
  const params = { eventId: String(event.eventId) };
  const shownCells = view.cancelled
    ? null
    : cells.map((cell) => (
        <EventsCardCell
          key={cell.pane}
          eventId={event.eventId}
          eventTitle={event.title}
          cell={cell}
          onSelect={onSelect}
        />
      ));

  return (
    <KkStateCard
      eyebrow={view.eyebrow}
      title={event.title}
      meta={view.meta}
      media={
        <EventThumb eventId={event.eventId} picture={event.picture} cancelled={view.cancelled} />
      }
      badge={<EventsRowBadge event={event} />}
      due={<EventDueChip due={row.due} />}
      countdown={<EventCountdown view={view} remaining={row.remaining} />}
      cancelled={view.cancelled}
      dimmed={view.dimmed}
      component={Link}
      to="/events/$eventId"
      params={params}
    >
      {shownCells}
    </KkStateCard>
  );
};
