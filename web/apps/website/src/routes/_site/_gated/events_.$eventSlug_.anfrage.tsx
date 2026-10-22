import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventsUnavailable } from '@/features/events/components/EventsUnavailable';
import { TicketRequestPage } from '@/features/events/components/TicketRequestPage';
import { buildTicketRequestHref } from '@/features/events/event-display';
import { publicEvents } from '@/lib/public-events/api';
import type { EventDetail } from '@/lib/public-events/schemas';
import { loadCanonicalDetail } from '@/lib/public-resource/canonical-detail';
import { useRouteRetry } from '@/lib/public-resource/use-route-retry';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const TicketRequestComponent: FC = () => {
  const event = Route.useLoaderData();

  return <TicketRequestPage key={event.eventId} event={event} />;
};

const TicketRequestErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <EventsUnavailable onRetry={retry} />;
};

const buildTicketRequestHead = (event: EventDetail): RouteHead => {
  const title = pageTitle(`Kartenanfrage · ${event.title}`);
  const description = `Karten für ${event.title} beim Furrschen Carnevals Club anfragen: Anzahl, Name und wie wir dich erreichen — wir melden uns persönlich.`;

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
    links: [{ rel: 'canonical', href: buildTicketRequestHref(event) }],
  };
};

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug_/anfrage')({
  loader: ({ params }): Promise<EventDetail> =>
    loadCanonicalDetail(publicEvents, params.eventSlug, (eventSlug) =>
      redirect({ to: '/events/$eventSlug/anfrage', params: { eventSlug }, replace: true }),
    ),
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildTicketRequestHead(loaderData),
  errorComponent: TicketRequestErrorComponent,
  component: TicketRequestComponent,
});
