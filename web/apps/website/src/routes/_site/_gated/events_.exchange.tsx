import { createFileRoute } from '@tanstack/react-router';
import { TicketExchangePage } from '@/features/events';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const exchangeDescription =
  'So stellen wir uns die Kartenbörse des Furrschen Carnevals Club e.V. vor: Karten für ausverkaufte Abende zurückgeben, ohne Aufpreis — in Planung.';

export const Route = createFileRoute('/_site/_gated/events_/exchange')({
  head: (): RouteHead => ({
    meta: [
      { title: pageTitle('Kartenbörse') },
      { name: 'description', content: exchangeDescription },
      { property: 'og:title', content: pageTitle('Kartenbörse') },
      { property: 'og:description', content: exchangeDescription },
    ],
  }),
  component: TicketExchangePage,
});
