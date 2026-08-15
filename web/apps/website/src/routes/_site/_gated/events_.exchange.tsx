import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const TicketExchangeComponent: FC = () => (
  <PlaceholderPage eyebrow="AUSVERKAUFT IST NICHT DAS ENDE" title="Kartenbörse" />
);

export const Route = createFileRoute('/_site/_gated/events_/exchange')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Kartenbörse') }] }),
  component: TicketExchangeComponent,
});
