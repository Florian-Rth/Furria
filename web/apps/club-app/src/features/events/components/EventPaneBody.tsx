import type { FC } from 'react';
import type { EventDetails, EventPaneKey } from '../schemas';
import { EventPaneDetails } from './EventPaneDetails';
import { EventPaneReview } from './EventPaneReview';
import { EventPaneRunningOrder } from './EventPaneRunningOrder';
import { EventPaneTickets } from './EventPaneTickets';
import { EventPaneWebsite } from './EventPaneWebsite';

interface EventPaneBodyProps {
  event: EventDetails;
  pane: EventPaneKey;
}

export const EventPaneBody: FC<EventPaneBodyProps> = ({ event, pane }) => {
  switch (pane) {
    case 'website':
      return <EventPaneWebsite event={event} />;
    case 'details':
      return <EventPaneDetails event={event} />;
    case 'tickets':
      return <EventPaneTickets event={event} />;
    case 'runningOrder':
      return <EventPaneRunningOrder event={event} />;
    case 'review':
      return <EventPaneReview event={event} />;
  }
};
