import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventsScreen } from '@/features/events/components/EventsScreen';
import { buildEventsJsonLd } from '@/features/events/events-json-ld';
import { publicEvents } from '@/lib/public-events/api';
import type { Event } from '@/lib/public-events/schemas';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead, jsonLdScript } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

const EventsComponent: FC = () => {
  const now = new Date();

  return <EventsScreen now={now} />;
};

const buildEventsScripts = (events: Event[] | null | undefined): RouteHead['scripts'] =>
  events === null || events === undefined ? [] : buildEventsJsonLd(events).map(jsonLdScript);

export const Route = createFileRoute('/_site/events')({
  loader: (): Promise<Event[] | null> => publicEvents.ensure().catch((): null => null),
  head: ({ loaderData }): RouteHead => ({
    ...indexablePageHead(STATIC_PAGES.events),
    scripts: buildEventsScripts(loaderData),
  }),
  component: EventsComponent,
});
