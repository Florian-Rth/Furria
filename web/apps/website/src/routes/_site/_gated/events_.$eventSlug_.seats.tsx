import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const SeatPickerComponent: FC = () => (
  <PlaceholderPage eyebrow="KARTEN & PLÄTZE" title="Platzwahl" />
);

export const Route = createFileRoute('/_site/_gated/events_/$eventSlug_/seats')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Platzwahl') }] }),
  component: SeatPickerComponent,
});
