import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  buildEventDocumentTitle,
  buildEventHref,
  buildEventJsonLd,
  EventDetailPage,
  findEventBySlug,
} from '@/features/events';
import { ALBUMS, AlbumPreview, selectNewestAlbumForEventType } from '@/features/gallery';
import type { Event } from '@/lib/seed/events';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const EventDetailComponent: FC = () => {
  const event = Route.useLoaderData();
  const album = selectNewestAlbumForEventType(ALBUMS, event.type);
  const albumPreview = album === undefined ? null : <AlbumPreview album={album} />;

  return <EventDetailPage event={event} albumPreview={albumPreview} />;
};

const buildEventDetailHead = (event: Event): RouteHead => {
  const title = pageTitle(buildEventDocumentTitle(event));

  return {
    meta: [
      { title },
      { name: 'description', content: event.teaser },
      { property: 'og:title', content: title },
      { property: 'og:description', content: event.teaser },
    ],
    links: [{ rel: 'canonical', href: buildEventHref(event.id) }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(buildEventJsonLd(event)) }],
  };
};

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug')({
  loader: ({ params }): Event => {
    const event = findEventBySlug(SEEDED_EVENTS, params.eventSlug);
    if (event === undefined) {
      throw notFound();
    }
    return event;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildEventDetailHead(loaderData),
  component: EventDetailComponent,
});
