import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventsJsonLd, EventsScreen } from '@/features/events';
import { ensurePublicEvents } from '@/lib/public-events/api';
import type { Event } from '@/lib/public-events/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const eventsDescription =
  'Alle Termine und Karten des Furrschen Carnevals Club e.V. — die Veranstaltungen der Session im Überblick.';

const EventsComponent: FC = () => {
  const now = new Date();

  return <EventsScreen now={now} />;
};

const buildEventsScripts = (events: Event[] | null | undefined): RouteHead['scripts'] =>
  events === null || events === undefined
    ? []
    : [{ type: 'application/ld+json', children: JSON.stringify(buildEventsJsonLd(events)) }];

export const Route = createFileRoute('/_site/_gated/events')({
  loader: (): Promise<Event[] | null> => ensurePublicEvents().catch((): null => null),
  head: ({ loaderData }): RouteHead => ({
    meta: [
      { title: pageTitle('Veranstaltungen') },
      { name: 'description', content: eventsDescription },
      { property: 'og:title', content: pageTitle('Veranstaltungen') },
      { property: 'og:description', content: eventsDescription },
    ],
    scripts: buildEventsScripts(loaderData),
  }),
  component: EventsComponent,
});
