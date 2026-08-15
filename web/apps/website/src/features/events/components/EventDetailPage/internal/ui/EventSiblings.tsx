import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { otherEventsKicker, otherEventsTitle } from '@/features/events/event-detail-content';
import { selectOtherEventsInSession } from '@/features/events/event-detail-display';
import type { Event } from '@/lib/seed/events';
import { EventSiblingCell } from '../layout/EventSiblingCell';
import { EventSiblingGrid } from '../layout/EventSiblingGrid';
import { EventSiblingCard } from './EventSiblingCard';

interface EventSiblingsProps {
  event: Event;
  events: Event[];
  now: Date;
}

export const EventSiblings: FC<EventSiblingsProps> = ({ event, events, now }) => {
  const siblings = selectOtherEventsInSession(events, event, now);
  if (siblings.length === 0) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header kicker={otherEventsKicker} title={otherEventsTitle} />
      <EventSiblingGrid>
        {siblings.map((sibling) => (
          <EventSiblingCell key={sibling.id}>
            <EventSiblingCard event={sibling} />
          </EventSiblingCell>
        ))}
      </EventSiblingGrid>
    </KkSection>
  );
};
