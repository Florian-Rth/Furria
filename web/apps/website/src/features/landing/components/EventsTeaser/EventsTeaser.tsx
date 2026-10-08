import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { SectionActionLink } from '@/components/SectionActionLink';
import {
  eventsTeaserAllLabel,
  eventsTeaserHeading,
} from '@/features/landing/events-teaser-content';
import { useTeaserEvents } from '@/features/landing/hooks/use-teaser-events';
import { TeaserGrid } from './internal/layout/TeaserGrid';
import { TeaserList } from './internal/layout/TeaserList';
import { EventCard } from './internal/ui/EventCard';
import { EventRow } from './internal/ui/EventRow';

export const EventsTeaser: FC = () => {
  const events = useTeaserEvents();

  return (
    <KkSection>
      <KkSection.Header
        title={eventsTeaserHeading}
        action={<SectionActionLink to="/events">{eventsTeaserAllLabel}</SectionActionLink>}
      />
      <TeaserGrid>
        {events.map((event) => (
          <Grid key={event.eventId} size={{ xs: 12, md: 4 }}>
            <EventCard event={event} />
          </Grid>
        ))}
      </TeaserGrid>
      <TeaserList>
        {events.map((event) => (
          <EventRow key={event.eventId} event={event} />
        ))}
      </TeaserList>
    </KkSection>
  );
};
