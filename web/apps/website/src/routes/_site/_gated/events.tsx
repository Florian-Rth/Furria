import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventsJsonLd, EventListPage, useEventsQuery } from '@/features/events';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const eventsDescription =
  'Alle Termine und Karten des Furrschen Carnevals Club e.V. — die Veranstaltungen der Session im Überblick.';

const EventsComponent: FC = () => {
  const { data } = useEventsQuery();

  if (data === undefined) {
    return null;
  }
  return <EventListPage events={data} now={new Date()} />;
};

export const Route = createFileRoute('/_site/_gated/events')({
  head: (): RouteHead => ({
    meta: [
      { title: pageTitle('Veranstaltungen') },
      { name: 'description', content: eventsDescription },
      { property: 'og:title', content: pageTitle('Veranstaltungen') },
      { property: 'og:description', content: eventsDescription },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(buildEventsJsonLd(SEEDED_EVENTS)),
      },
    ],
  }),
  component: EventsComponent,
});
