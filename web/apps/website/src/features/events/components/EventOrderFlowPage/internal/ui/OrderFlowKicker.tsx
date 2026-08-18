import { KkEyebrow } from '@furria/ui';
import type { FC } from 'react';
import { deriveOrderFlowKicker } from '@/features/events/order-flow-display';
import type { Event } from '@/lib/seed/events';

interface OrderFlowKickerProps {
  event: Event;
  lead: string;
}

export const OrderFlowKicker: FC<OrderFlowKickerProps> = ({ event, lead }) => {
  const kicker = deriveOrderFlowKicker(event, lead);

  return <KkEyebrow>{kicker}</KkEyebrow>;
};
