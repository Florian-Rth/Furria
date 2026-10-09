import { createFileRoute, notFound, redirect, useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildTicketRequestHref, EventsUnavailable, TicketRequestPage } from '@/features/events';
import { ApiError } from '@/lib/api/errors';
import { buildIdSlug, readSlugId } from '@/lib/id-slug';
import { ensurePublicEvent } from '@/lib/public-events/api';
import type { EventDetail } from '@/lib/public-events/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NOT_FOUND_STATUS = 404;

const TicketRequestComponent: FC = () => {
  const event = Route.useLoaderData();

  return <TicketRequestPage key={event.eventId} event={event} />;
};

const TicketRequestErrorComponent: FC = () => {
  const router = useRouter();

  const retry = (): void => {
    void router.invalidate();
  };

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

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug_/anfrage')({
  loader: async ({ params }): Promise<EventDetail> => {
    const eventId = readSlugId(params.eventSlug);
    if (eventId === null) {
      throw notFound();
    }

    const event = await loadEvent(eventId);
    const canonicalSlug = buildIdSlug(event.eventId, event.title);
    if (params.eventSlug !== canonicalSlug) {
      throw redirect({
        to: '/events/$eventSlug/anfrage',
        params: { eventSlug: canonicalSlug },
        replace: true,
      });
    }
    return event;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildTicketRequestHead(loaderData),
  errorComponent: TicketRequestErrorComponent,
  component: TicketRequestComponent,
});
