import { KkLead } from '@furria/ui';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { orderStateHeroes } from '@/features/events/order-confirmation-content';
import { derivePaymentStatusColor } from '@/features/events/order-confirmation-display';
import type { Order } from '@/lib/seed/orders';
import { OrderConfirmationHeadline } from './OrderConfirmationHeadline';

interface OrderStateHeroProps {
  order: Order;
}

export const OrderStateHero: FC<OrderStateHeroProps> = ({ order }) => {
  const hero = orderStateHeroes[order.paymentStatus];
  const color = derivePaymentStatusColor(order.paymentStatus);

  return (
    <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
      <Chip variant="outlined" color={color} label={hero.kicker} />
      <OrderConfirmationHeadline headline={hero.headline} />
      <KkLead>{hero.body}</KkLead>
    </Stack>
  );
};
