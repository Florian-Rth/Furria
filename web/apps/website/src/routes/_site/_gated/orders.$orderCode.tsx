import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const OrderConfirmationComponent: FC = () => (
  <PlaceholderPage
    eyebrow="DEINE BESTELLUNG"
    title="Deine Karten"
    ctaLabel="Zu den Veranstaltungen →"
    ctaTo="/events"
  />
);

export const Route = createFileRoute('/_site/_gated/orders/$orderCode')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Deine Karten') }] }),
  component: OrderConfirmationComponent,
});
