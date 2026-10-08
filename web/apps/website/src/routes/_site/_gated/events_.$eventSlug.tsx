import { createFileRoute, notFound, redirect, useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  buildEventDocumentTitle,
  buildEventHref,
  buildEventJsonLd,
  EventDetailPage,
  EventsUnavailable,
} from '@/features/events';
import { ApiError } from '@/lib/api/errors';
import { ensurePublicEvent } from '@/lib/public-events/api';
import { buildEventSlug, readEventId } from '@/lib/public-events/event-slug';
import type { EventDetail } from '@/lib/public-events/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NOT_FOUND_STATUS = 404;

const EventDetailComponent: FC = () => <EventDetailPage event={Route.useLoaderData()} />;

const EventDetailErrorComponent: FC = () => {
  const router = useRouter();

  const retry = (): void => {
    void router.invalidate();
  };

  return <EventsUnavailable onRetry={retry} />;
};

const buildEventDetailHead = (event: EventDetail): RouteHead => {
  const title = pageTitle(buildEventDocumentTitle(event));

  return {
    meta: [
      { title },
      { name: 'description', content: event.teaser },
      { property: 'og:title', content: title },
      { property: 'og:description', content: event.teaser },
    ],
    links: [{ rel: 'canonical', href: buildEventHref(event) }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(buildEventJsonLd(event)) }],
  };
};

const loadEvent = async (eventId: number): Promise<EventDetail> => {
  try {
    return await ensurePublicEvent(eventId);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      throw notFound();
    }
    throw error;
  }
};

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug')({
  loader: async ({ params }): Promise<EventDetail> => {
    const eventId = readEventId(params.eventSlug);
    if (eventId === null) {
      throw notFound();
    }

    const event = await loadEvent(eventId);
    const canonicalSlug = buildEventSlug(event.eventId, event.title);
    if (params.eventSlug !== canonicalSlug) {
      throw redirect({
        to: '/events/$eventSlug',
        params: { eventSlug: canonicalSlug },
        replace: true,
      });
    }
    return event;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildEventDetailHead(loaderData),
  errorComponent: EventDetailErrorComponent,
  component: EventDetailComponent,
});
