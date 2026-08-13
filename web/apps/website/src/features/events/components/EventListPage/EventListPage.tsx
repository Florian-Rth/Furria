import { KkRule, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { EventList } from '@/features/events/components/EventList/EventList';
import { NextEventCard } from '@/features/events/components/NextEventCard/NextEventCard';
import type { Event } from '@/lib/seed/events';
import { EventsFaq } from './internal/ui/EventsFaq';
import { EventsFilmstrip } from './internal/ui/EventsFilmstrip';
import { EventsHero } from './internal/ui/EventsHero';
import { ExchangeTeaserBand } from './internal/ui/ExchangeTeaserBand';
import { VenueBlock } from './internal/ui/VenueBlock';

interface EventListPageProps {
  events: Event[];
  now: Date;
}

export const EventListPage: FC<EventListPageProps> = ({ events, now }) => (
  <PageLayout>
    <PageLayout.Body>
      <EventsHero events={events} now={now} aside={<NextEventCard events={events} now={now} />} />
      <KkRule />
      <EventList events={events} now={now} />
      <EventsFilmstrip />
      <VenueBlock />
      <EventsFaq />
    </PageLayout.Body>
    <ExchangeTeaserBand />
  </PageLayout>
);
