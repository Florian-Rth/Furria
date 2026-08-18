import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import { buildEventHref } from '@/features/events/event-display';
import { deriveOrderFlowBackLabel } from '@/features/events/order-flow-display';
import type { Event } from '@/lib/seed/events';

interface OrderFlowBackLinkProps {
  event: Event;
}

export const OrderFlowBackLink: FC<OrderFlowBackLinkProps> = ({ event }) => {
  const label = deriveOrderFlowBackLabel(event);

  const to = buildEventHref(event.id);

  return <BackLink to={to}>{label}</BackLink>;
};
