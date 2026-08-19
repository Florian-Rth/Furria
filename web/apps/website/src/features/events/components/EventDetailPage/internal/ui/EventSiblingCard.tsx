import { KkCard } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventCardSummary } from '@/features/events/components/EventCardSummary';
import { buildEventHref } from '@/features/events/event-display';
import type { Event } from '@/lib/seed/events';

interface EventSiblingCardProps {
  event: Event;
}

export const EventSiblingCard: FC<EventSiblingCardProps> = ({ event }) => (
  <KkCard>
    <KkCard.Action component={Link} to={buildEventHref(event.id)} aria-label={event.title}>
      <KkCard.Body>
        <EventCardSummary event={event} />
      </KkCard.Body>
    </KkCard.Action>
  </KkCard>
);
