import { KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveScheduleRangeLabel, selectEventsByDate } from '@/features/events/event-display';
import { scheduleHeading } from '@/features/events/list-content';
import type { Event } from '@/lib/seed/events';
import { EventRowList } from './internal/layout/EventRowList';
import { useAnchorHighlight } from './internal/logic/use-anchor-highlight';
import { EventEndOfSeason } from './internal/ui/EventEndOfSeason';
import { EventListRow } from './internal/ui/EventListRow';

interface EventListProps {
  events: Event[];
  now: Date;
}

export const EventList: FC<EventListProps> = ({ events, now }) => {
  const highlightedEventId = useAnchorHighlight();
  const orderedEvents = selectEventsByDate(events);
  const rangeLabel = deriveScheduleRangeLabel(events);

  if (orderedEvents.length === 0) {
    return <EventEndOfSeason />;
  }

  const rangeAction =
    rangeLabel === null ? undefined : (
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {rangeLabel}
      </Typography>
    );

  return (
    <KkSection>
      <KkSection.Header title={scheduleHeading} action={rangeAction} />
      <EventRowList>
        {orderedEvents.map((event) => (
          <EventListRow
            key={event.id}
            event={event}
            now={now}
            highlighted={event.id === highlightedEventId}
          />
        ))}
      </EventRowList>
    </KkSection>
  );
};
