import type { FC } from 'react';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderFlowPlaceholders } from '@/features/events/order-flow-content';
import { OrderFlowPlaceholderPanel } from './OrderFlowPlaceholderPanel';

export const OrderFlowSelectionStep: FC = () => (
  <OrderPanel tone="placeholder" sx={{ gap: 1.5 }}>
    <OrderFlowPlaceholderPanel placeholder={orderFlowPlaceholders.selection} />
  </OrderPanel>
);
