import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const TicketsComponent: FC = () => <PlaceholderPage title="Tickets" />;

export const Route = createFileRoute('/_site/_gated/tickets')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Tickets') }] }),
  component: TicketsComponent,
});
