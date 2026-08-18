import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  buildOrderFlowDocumentTitle,
  buildOrderFlowHref,
  EventOrderFlowPage,
  findEventBySlug,
  OrderFlowSearchSchema,
} from '@/features/events';
import type { Event } from '@/lib/seed/events';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const EventOrderFlowComponent: FC = () => <EventOrderFlowPage event={Route.useLoaderData()} />;

const buildOrderFlowHead = (event: Event): RouteHead => {
  const title = pageTitle(buildOrderFlowDocumentTitle(event));

  return {
    meta: [{ title }, { property: 'og:title', content: title }],
    links: [{ rel: 'canonical', href: buildOrderFlowHref(event.id) }],
  };
};

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug_/order')({
  validateSearch: OrderFlowSearchSchema,
  loader: ({ params }): Event => {
    const event = findEventBySlug(SEEDED_EVENTS, params.eventSlug);
    if (event === undefined) {
      throw notFound();
    }
    return event;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildOrderFlowHead(loaderData),
  component: EventOrderFlowComponent,
});
