import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const EventDetailComponent: FC = () => (
  <PlaceholderPage eyebrow="SESSION 2025/26" title="Veranstaltung" />
);

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Veranstaltung') }] }),
  component: EventDetailComponent,
});
