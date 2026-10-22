import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventDetailPage } from '@/features/events/components/EventDetailPage/EventDetailPage';
import { EventsUnavailable } from '@/features/events/components/EventsUnavailable';
import { buildEventDocumentTitle } from '@/features/events/event-detail-display';
import { buildEventHref } from '@/features/events/event-display';
import { buildEventJsonLd } from '@/features/events/events-json-ld';
import { publicEvents } from '@/lib/public-events/api';
import type { EventDetail } from '@/lib/public-events/schemas';
import { loadCanonicalDetail } from '@/lib/public-resource/canonical-detail';
import { useRouteRetry } from '@/lib/public-resource/use-route-retry';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const EventDetailComponent: FC = () => <EventDetailPage event={Route.useLoaderData()} />;

const EventDetailErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <EventsUnavailable onRetry={retry} />;
};

const buildEventPictureMeta = (event: EventDetail): RouteHead['meta'] =>
  event.picture === null
    ? []
    : [
        { property: 'og:image', content: event.picture.largeUrl },
        { property: 'og:image:alt', content: event.title },
      ];

const buildEventDetailHead = (event: EventDetail): RouteHead => {
  const title = pageTitle(buildEventDocumentTitle(event));

  return {
    meta: [
      { title },
      { name: 'description', content: event.teaser },
      { property: 'og:title', content: title },
      { property: 'og:description', content: event.teaser },
      ...buildEventPictureMeta(event),
    ],
    links: [{ rel: 'canonical', href: buildEventHref(event) }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(buildEventJsonLd(event)) }],
  };
};

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug')({
  loader: ({ params }): Promise<EventDetail> =>
    loadCanonicalDetail(publicEvents, params.eventSlug, (eventSlug) =>
      redirect({ to: '/events/$eventSlug', params: { eventSlug }, replace: true }),
    ),
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildEventDetailHead(loaderData),
  errorComponent: EventDetailErrorComponent,
  component: EventDetailComponent,
});
