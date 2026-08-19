import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { OrderConfirmationPage, orderConfirmationDocumentTitle } from '@/features/events';
import { SEEDED_EVENTS } from '@/lib/seed/events';
import type { RouteHead } from '@/lib/seo';
import { NO_INDEX_META, pageTitle } from '@/lib/seo';

const OrderConfirmationComponent: FC = () => {
  const { orderCode } = Route.useParams();
  const [now] = useState(() => new Date());

  return <OrderConfirmationPage orderCode={orderCode} events={SEEDED_EVENTS} now={now} />;
};

export const Route = createFileRoute('/_site/_gated/orders/$orderCode')({
  head: (): RouteHead => ({
    meta: [{ title: pageTitle(orderConfirmationDocumentTitle) }, NO_INDEX_META],
  }),
  component: OrderConfirmationComponent,
});
