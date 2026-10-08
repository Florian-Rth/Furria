import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelFold, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import {
  ADD_EVENT_ACTION_LABEL,
  ADD_EVENT_PILL_LABEL,
  EVENTS_EMPTY,
  EVENTS_PANEL_TITLE,
  partitionEvents,
} from '../events-labels';
import type { EventSummary } from '../schemas';
import { EventRow } from './EventRow';

const ADD_ACTION: KkPanelAction = {
  label: ADD_EVENT_PILL_LABEL,
  icon: 'add',
  ariaLabel: ADD_EVENT_ACTION_LABEL,
  component: Link,
  to: '/events/new',
};

interface EventsPanelProps {
  events: readonly EventSummary[];
}

export const EventsPanel: FC<EventsPanelProps> = ({ events }) => {
  const { highlightedKey } = useLanding();
  const { upcoming, over, overLabel } = partitionEvents(events);

  const upcomingRows = upcoming.map((event) => (
    <EventRow key={event.eventId} event={event} highlightedKey={highlightedKey} />
  ));
  const overRows = over.map((event) => (
    <EventRow key={event.eventId} event={event} highlightedKey={highlightedKey} />
  ));
  const overFold =
    overRows.length === 0 ? null : <KkPanelFold label={overLabel}>{overRows}</KkPanelFold>;

  const body =
    events.length === 0 ? (
      <KkEmptyState title={EVENTS_EMPTY.title} description={EVENTS_EMPTY.description} />
    ) : (
      <KkPanel variant="list">
        {upcomingRows}
        {overFold}
      </KkPanel>
    );

  return (
    <KkPanelSection title={EVENTS_PANEL_TITLE} action={ADD_ACTION}>
      {body}
    </KkPanelSection>
  );
};
